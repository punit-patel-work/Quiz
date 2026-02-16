import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/classes/[id]/quizzes/[quizId]/results - Get all student results
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

        // Verify teacher
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the teacher can view results" },
                { status: 403 }
            )
        }

        // Get quiz
        const quiz = await prisma.classQuiz.findUnique({
            where: { id: params.quizId },
        })

        if (!quiz || quiz.classId !== params.id) {
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            )
        }

        // Get all members and their attempts
        const members = await prisma.classMember.findMany({
            where: { classId: params.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                attempts: {
                    where: { classQuizId: params.quizId },
                },
            },
            orderBy: { user: { name: "asc" } },
        })

        const results = members.map((member) => {
            const attempts = member.attempts
            const attemptsCount = attempts.length

            // Find best submitted attempt
            const bestAttempt = attempts
                .filter(a => a.status === "submitted" && a.percentage !== null)
                .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0]

            // If no submitted attempt, fall back to latest attempt (e.g. in_progress)
            const latestAttempt = attempts.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0]

            const displayAttempt = bestAttempt || latestAttempt || null

            return {
                memberId: member.id,
                userId: member.userId,
                name: member.user.name,
                email: member.user.email,
                hasAttempted: attemptsCount > 0,
                attemptsCount,
                status: displayAttempt?.status || "not_started",
                score: displayAttempt?.score ?? null,
                totalQuestions: displayAttempt?.totalQuestions ?? (quiz.questions as any[]).length,
                percentage: displayAttempt?.percentage ?? null,
                startedAt: displayAttempt?.startedAt ?? null,
                submittedAt: displayAttempt?.submittedAt ?? null,
                autoSubmitted: displayAttempt?.autoSubmitted ?? false,
            }
        })

        // Summary stats
        const attemptedCount = results.filter(r => r.hasAttempted).length
        const submittedCount = results.filter(r => r.status === "submitted").length
        const averageScore = submittedCount > 0
            ? results.filter(r => r.percentage !== null).reduce((sum, r) => sum + (r.percentage || 0), 0) / submittedCount
            : 0

        return NextResponse.json({
            quiz: {
                id: quiz.id,
                name: quiz.name,
                totalQuestions: (quiz.questions as any[]).length,
                startTime: quiz.startTime,
                endTime: quiz.endTime,
                duration: quiz.duration,
            },
            summary: {
                totalStudents: members.length,
                attempted: attemptedCount,
                submitted: submittedCount,
                notStarted: members.length - attemptedCount,
                averageScore: Math.round(averageScore * 10) / 10,
            },
            results,
        })
    } catch (error) {
        console.error("Results fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch results" },
            { status: 500 }
        )
    }
}
