import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { authorizeQuizEdit } from "@/lib/class-permissions"
import { logClassActivity } from "@/lib/class-activity"

// GET /api/classes/[id]/quizzes/[quizId] - Get quiz details
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string; quizId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const quiz = await prisma.classQuiz.findUnique({
            where: { id: params.quizId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        teacherId: true,
                    },
                },
                _count: {
                    select: { attempts: true },
                },
            },
        })

        if (!quiz) {
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            )
        }

        if (quiz.classId !== params.id) {
            return NextResponse.json(
                { error: "Quiz does not belong to this class" },
                { status: 400 }
            )
        }

        // Check access
        const isTeacher = quiz.class.teacherId === session.user.id
        const member = await prisma.classMember.findUnique({
            where: {
                classId_userId: {
                    classId: params.id,
                    userId: session.user.id,
                },
            },
        })
        const memberRole = member?.role || null

        if (!isTeacher && !member) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        // For students, check if quiz is available
        const now = new Date()
        if (!isTeacher && quiz.startTime > now) {
            return NextResponse.json(
                { error: "Quiz is not yet available" },
                { status: 403 }
            )
        }

        // If student (and not TA with edit rights), don't include questions unless starting attempt (handled by separate endpoint)
        const canEdit = await authorizeQuizEdit(params.id, session.user.id)

        if (!canEdit) {
            // Count attempts
            const attemptsCount = member ? await prisma.classQuizAttempt.count({
                where: {
                    classQuizId: params.quizId,
                    memberId: member.id,
                },
            }) : 0

            const latestAttempt = member ? await prisma.classQuizAttempt.findFirst({
                where: {
                    classQuizId: params.quizId,
                    memberId: member.id,
                },
                orderBy: { startedAt: "desc" },
            }) : null

            // Can attempt if manually allowed (infinite) or below max attempts
            // maxAttempts default is 1. If 0 or null (unlikely based on schema default), assume 1.
            const maxAttempts = quiz.maxAttempts || 1
            const canAttempt = !latestAttempt || (attemptsCount < maxAttempts && latestAttempt.status === "submitted")
            // Note: If latest attempt is in_progress, they should "continue" it rather than start new, 
            // but the UI might handle that differently. For now, let's say canAttempt = true if they have tries left.
            // If in_progress, the start endpoint usually resumes. 
            // We should check if they have an active attempt.

            const activeAttempt = member ? await prisma.classQuizAttempt.findFirst({
                where: {
                    classQuizId: params.quizId,
                    memberId: member.id,
                    status: "in_progress",
                },
            }) : null

            return NextResponse.json({
                id: quiz.id,
                name: quiz.name,
                description: quiz.description,
                duration: quiz.duration,
                startTime: quiz.startTime,
                endTime: quiz.endTime,
                showResults: quiz.showResults,
                maxAttempts: quiz.maxAttempts,
                attemptsTaken: attemptsCount,
                totalQuestions: (quiz.questions as any[]).length,
                attemptStatus: latestAttempt?.status || null,
                hasAttempted: attemptsCount > 0,
                canAttempt: (attemptsCount < maxAttempts || !!activeAttempt) && quiz.endTime > now,
                activeAttemptId: activeAttempt?.id,
                isTeacher: false,
                isTA: memberRole === "assistant"
            })
        }

        return NextResponse.json({
            ...quiz,
            isTeacher: isTeacher,
            isTA: !isTeacher && canEdit
        })
    } catch (error) {
        console.error("Quiz fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch quiz" },
            { status: 500 }
        )
    }
}

// PUT /api/classes/[id]/quizzes/[quizId] - Update quiz
export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string; quizId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const canEdit = await authorizeQuizEdit(params.id, session.user.id)

        if (!canEdit) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        const quiz = await prisma.classQuiz.findUnique({
            where: { id: params.quizId },
        })

        if (!quiz || quiz.classId !== params.id) {
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { name, description, questions, duration, startTime, endTime, showResults, shuffleQuestions } = body

        const updatedQuiz = await prisma.classQuiz.update({
            where: { id: params.quizId },
            data: {
                name: name?.trim() || quiz.name,
                description: description !== undefined ? (description?.trim() || null) : quiz.description,
                questions: questions || quiz.questions,
                duration: duration || quiz.duration,
                startTime: startTime ? new Date(startTime) : quiz.startTime,
                endTime: endTime ? new Date(endTime) : quiz.endTime,
                showResults: showResults ?? quiz.showResults,
                shuffleQuestions: shuffleQuestions ?? quiz.shuffleQuestions,
            },
        })

        await logClassActivity({
            classId: params.id,
            actorId: session.user.id,
            action: "update_quiz",
            targetType: "quiz",
            targetId: quiz.id,
            details: { name: updatedQuiz.name }
        })

        return NextResponse.json(updatedQuiz)
    } catch (error) {
        console.error("Quiz update error:", error)
        return NextResponse.json(
            { error: "Failed to update quiz" },
            { status: 500 }
        )
    }
}

// DELETE /api/classes/[id]/quizzes/[quizId] - Delete quiz
export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string; quizId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const canEdit = await authorizeQuizEdit(params.id, session.user.id)

        if (!canEdit) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        await prisma.classQuiz.delete({
            where: { id: params.quizId },
        })

        await logClassActivity({
            classId: params.id,
            actorId: session.user.id,
            action: "update_quiz", // Note: A dedicated delete_quiz action might be better, parsing as update here. Let's just use update_quiz to mean modifications. We'll use "update_quiz" with details "Deleted Quiz"
            targetType: "quiz",
            targetId: params.quizId,
            details: { name: "Deleted Quiz" }
        })

        return NextResponse.json({ message: "Quiz deleted successfully" })
    } catch (error) {
        console.error("Quiz deletion error:", error)
        return NextResponse.json(
            { error: "Failed to delete quiz" },
            { status: 500 }
        )
    }
}
