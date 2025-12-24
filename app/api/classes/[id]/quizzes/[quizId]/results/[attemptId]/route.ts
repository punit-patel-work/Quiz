import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/classes/[id]/quizzes/[quizId]/results/[attemptId] - Modify student score
export async function PUT(
    request: Request,
    { params }: { params: { id: string; quizId: string; attemptId: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user is class teacher
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
            select: { teacherId: true },
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const attempt = await prisma.classQuizAttempt.findUnique({
            where: { id: params.attemptId },
            include: { classQuiz: true },
        })

        if (!attempt || attempt.classQuiz.id !== params.quizId) {
            return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
        }

        const body = await request.json()
        const { newScore, reason } = body

        if (newScore === undefined || !reason) {
            return NextResponse.json(
                { error: "New score and reason are required" },
                { status: 400 }
            )
        }

        if (newScore < 0 || newScore > attempt.totalQuestions) {
            return NextResponse.json(
                { error: `Score must be between 0 and ${attempt.totalQuestions}` },
                { status: 400 }
            )
        }

        const originalScore = attempt.score || 0
        const newPercentage = (newScore / attempt.totalQuestions) * 100

        // Create modification record for audit trail
        await prisma.scoreModification.create({
            data: {
                attemptId: params.attemptId,
                originalScore,
                newScore,
                reason,
                modifiedById: session.user.id,
            },
        })

        // Update the attempt
        const updatedAttempt = await prisma.classQuizAttempt.update({
            where: { id: params.attemptId },
            data: {
                score: newScore,
                percentage: newPercentage,
            },
        })

        // Log admin action
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: "modify_score",
                targetType: "attempt",
                targetId: params.attemptId,
                details: { originalScore, newScore, reason },
            },
        })

        return NextResponse.json({
            message: "Score updated successfully",
            attempt: updatedAttempt,
        })
    } catch (error) {
        console.error("Modify score error:", error)
        return NextResponse.json({ error: "Failed to modify score" }, { status: 500 })
    }
}

// GET /api/classes/[id]/quizzes/[quizId]/results/[attemptId] - Get attempt details with modifications
export async function GET(
    request: Request,
    { params }: { params: { id: string; quizId: string; attemptId: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user is class teacher
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
            select: { teacherId: true },
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const attempt = await prisma.classQuizAttempt.findUnique({
            where: { id: params.attemptId },
            include: {
                member: {
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                },
                scoreModifications: {
                    include: {
                        modifiedBy: {
                            select: { name: true, email: true },
                        },
                    },
                    orderBy: { modifiedAt: "desc" },
                },
            },
        })

        if (!attempt) {
            return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
        }

        return NextResponse.json(attempt)
    } catch (error) {
        console.error("Get attempt error:", error)
        return NextResponse.json({ error: "Failed to fetch attempt" }, { status: 500 })
    }
}
