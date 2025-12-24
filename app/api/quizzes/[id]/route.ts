import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/quizzes/[id] - Fetch specific quiz
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

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: params.id,
                userId: session.user.id, // Ensure user owns this quiz
            },
        })

        if (!quiz) {
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            id: quiz.id,
            name: quiz.name,
            description: quiz.description,
            questions: quiz.questions,
            createdAt: quiz.createdAt,
        })
    } catch (error) {
        console.error("Quiz fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch quiz" },
            { status: 500 }
        )
    }
}

// DELETE /api/quizzes/[id] - Delete quiz
export async function DELETE(
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

        // Verify ownership before deleting
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        })

        if (!quiz) {
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            )
        }

        // Delete quiz (results will cascade delete)
        await prisma.quiz.delete({
            where: { id: params.id },
        })

        return NextResponse.json({
            message: "Quiz deleted successfully",
        })
    } catch (error) {
        console.error("Quiz deletion error:", error)
        return NextResponse.json(
            { error: "Failed to delete quiz" },
            { status: 500 }
        )
    }
}
