import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/classes/[id]/quizzes/[quizId] - Get quiz details
export async function GET(
    request: Request,
    { params }: { params: { id: string; quizId: string } }
) {
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

        // If student, don't include questions unless starting attempt (handled by separate endpoint)
        if (!isTeacher) {
            const attempt = member ? await prisma.classQuizAttempt.findFirst({
                where: {
                    classQuizId: params.quizId,
                    memberId: member.id,
                },
                orderBy: { startedAt: "desc" },
            }) : null

            return NextResponse.json({
                id: quiz.id,
                name: quiz.name,
                description: quiz.description,
                duration: quiz.duration,
                startTime: quiz.startTime,
                endTime: quiz.endTime,
                showResults: quiz.showResults,
                totalQuestions: (quiz.questions as any[]).length,
                attemptStatus: attempt?.status || null,
                hasAttempted: !!attempt,
                canAttempt: !attempt && quiz.endTime > now,
                isTeacher: false,
            })
        }

        return NextResponse.json({
            ...quiz,
            isTeacher: true,
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
    { params }: { params: { id: string; quizId: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verify ownership
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData || classData.teacherId !== session.user.id) {
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
    { params }: { params: { id: string; quizId: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verify ownership
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        await prisma.classQuiz.delete({
            where: { id: params.quizId },
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
