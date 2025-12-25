import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validateQuizName, generateQuizDescription } from "@/lib/quiz-storage"
import { validateQuizJSON } from "@/lib/quiz-validator"

// GET /api/quizzes - List user's saved quizzes
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const quizzes = await prisma.quiz.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { results: true },
                },
            },
        })

        // Add question count from JSON
        const quizzesWithCount = quizzes.map((quiz) => ({
            ...quiz,
            questionCount: 0, // Will be populated from full quiz if needed
            attemptCount: quiz._count.results,
        }))

        return NextResponse.json(quizzesWithCount)
    } catch (error) {
        console.error("Quiz list error:", error)
        return NextResponse.json(
            { error: "Failed to fetch quizzes" },
            { status: 500 }
        )
    }
}

// POST /api/quizzes - Create new quiz
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
        const { name, questions } = body

        // Validate quiz name
        const nameValidation = validateQuizName(name)
        if (!nameValidation.valid) {
            return NextResponse.json(
                { error: nameValidation.error },
                { status: 400 }
            )
        }

        // Validate quiz JSON
        const quizValidation = validateQuizJSON(questions)
        if (!quizValidation.success) {
            return NextResponse.json(
                { error: "Invalid quiz format" },
                { status: 400 }
            )
        }

        // Generate description
        const description = generateQuizDescription(quizValidation.data!)

        // Create quiz
        const quiz = await prisma.quiz.create({
            data: {
                userId: session.user.id,
                name,
                description,
                questions: quizValidation.data!,
            },
        })

        return NextResponse.json({
            id: quiz.id,
            name: quiz.name,
            description: quiz.description,
            questionCount: quizValidation.data!.length,
        })
    } catch (error) {
        console.error("Quiz creation error:", error)
        return NextResponse.json(
            { error: "Failed to create quiz" },
            { status: 500 }
        )
    }
}
