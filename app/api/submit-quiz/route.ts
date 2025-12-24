import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { optimizeAnswers } from "@/lib/quiz-storage"
import { calculateScore } from "@/lib/scoring"

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { quizId, userAnswers, timeLimit, timeTaken } = body

        // Fetch quiz to get questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
        })

        if (!quiz) {
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            )
        }

        const questions = quiz.questions as any[]

        // Convert userAnswers array to Map with proper typing
        const answersMap = new Map<number, string | boolean | null>(
            userAnswers.map((item: any) => [Number(item.questionId), item.userAnswer])
        )

        // Calculate score
        const results = calculateScore(questions, answersMap)

        // Optimize answers for storage (only store values, not full questions)
        const optimizedAnswers = optimizeAnswers(answersMap, questions)

        // Save to database
        const quizResult = await prisma.quizResult.create({
            data: {
                userId: session.user.id,
                quizId: quizId,
                score: results.score,
                totalQuestions: results.totalQuestions,
                percentage: results.percentage,
                userAnswers: optimizedAnswers,
                timeLimit: timeLimit || null,
                timeTaken: timeTaken || null,
            },
        })

        return NextResponse.json({
            id: quizResult.id,
            ...results,
        })
    } catch (error) {
        console.error("Quiz submission error:", error)
        return NextResponse.json(
            { error: "Failed to submit quiz" },
            { status: 500 }
        )
    }
}
