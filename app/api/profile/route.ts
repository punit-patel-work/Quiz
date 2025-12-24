import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET /api/profile - Get user profile
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        quizResults: true,
                        quizzes: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Get quiz statistics
        const quizResults = await prisma.quizResult.findMany({
            where: { userId: session.user.id },
            select: {
                percentage: true,
                createdAt: true,
            },
        })

        const stats = {
            totalQuizzesTaken: quizResults.length,
            totalQuizzesSaved: user._count.quizzes,
            averageScore: quizResults.length > 0
                ? quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length
                : 0,
            bestScore: quizResults.length > 0
                ? Math.max(...quizResults.map(r => r.percentage))
                : 0,
            lastQuizDate: quizResults.length > 0
                ? quizResults.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
                : null,
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
            },
            stats,
        })
    } catch (error) {
        console.error("Profile fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        )
    }
}

// PUT /api/profile - Update user profile
export async function PUT(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name } = body

        // Validate name
        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            )
        }

        if (name.length > 100) {
            return NextResponse.json(
                { error: "Name must be 100 characters or less" },
                { status: 400 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { name: name.trim() },
            select: {
                id: true,
                name: true,
                email: true,
            },
        })

        return NextResponse.json({
            message: "Profile updated successfully",
            user: updatedUser,
        })
    } catch (error) {
        console.error("Profile update error:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}
