import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/my-classes/[id]/quizzes/[quizId]/result - Get student's result for a quiz
export async function GET(
    request: Request,
    { params }: { params: { id: string; quizId: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check membership
        const member = await prisma.classMember.findUnique({
            where: {
                classId_userId: {
                    classId: params.id,
                    userId: session.user.id,
                },
            },
        })

        if (!member) {
            return NextResponse.json({ error: "Not a member" }, { status: 403 })
        }

        // Get quiz info
        const quiz = await prisma.classQuiz.findUnique({
            where: { id: params.quizId },
            select: {
                id: true,
                name: true,
                showResults: true,
            },
        })

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
        }

        // Get the latest submitted attempt
        const attempt = await prisma.classQuizAttempt.findFirst({
            where: {
                classQuizId: params.quizId,
                memberId: member.id,
                status: "submitted",
            },
            orderBy: { submittedAt: "desc" },
        })

        if (!attempt) {
            return NextResponse.json({ error: "No result found" }, { status: 404 })
        }

        return NextResponse.json({
            quizName: quiz.name,
            score: attempt.score || 0,
            totalQuestions: attempt.totalQuestions,
            percentage: attempt.percentage || 0,
            submittedAt: attempt.submittedAt,
            showResults: quiz.showResults,
        })
    } catch (error) {
        console.error("Get result error:", error)
        return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 })
    }
}
