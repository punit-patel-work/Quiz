import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const results = await prisma.quizResult.findMany({
            where: { userId: session.user.id },
            include: {
                quiz: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        const formattedResults = results.map((result) => ({
            id: result.id,
            score: result.score,
            totalQuestions: result.totalQuestions,
            percentage: result.percentage,
            createdAt: result.createdAt,
            quizName: result.quiz.name,
        }))

        return NextResponse.json(formattedResults)
    } catch (error) {
        console.error("Quiz history error:", error)
        return NextResponse.json(
            { error: "Failed to fetch quiz history" },
            { status: 500 }
        )
    }
}
