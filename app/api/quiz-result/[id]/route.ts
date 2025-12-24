import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { reconstructResults } from "@/lib/quiz-storage"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const result = await prisma.quizResult.findUnique({
            where: {
                id: params.id,
                userId: session.user.id, // Ensure user can only view their own results
            },
            include: {
                quiz: true, // Include quiz to get questions
            },
        })

        if (!result) {
            return NextResponse.json(
                { error: "Quiz result not found" },
                { status: 404 }
            )
        }

        const questions = result.quiz.questions as any[]
        const optimizedAnswers = result.userAnswers as { questionId: number; answer: string | boolean | null }[]

        // Reconstruct full results from quiz + answers
        const fullResults = reconstructResults(questions, optimizedAnswers)

        return NextResponse.json({
            id: result.id,
            score: result.score,
            totalQuestions: result.totalQuestions,
            percentage: result.percentage,
            quizData: questions,
            results: fullResults,
            quizName: result.quiz.name,
            timeLimit: result.timeLimit,
            timeTaken: result.timeTaken,
            createdAt: result.createdAt,
        })
    } catch (error) {
        console.error("Quiz result error:", error)
        return NextResponse.json(
            { error: "Failed to fetch quiz result" },
            { status: 500 }
        )
    }
}
