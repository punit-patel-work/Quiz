import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/classes/[id]/quizzes/[quizId]/corrections - List corrections
export async function GET(
    request: Request,
    { params }: { params: { id: string; quizId: string } }
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

        const corrections = await prisma.questionCorrection.findMany({
            where: { classQuizId: params.quizId },
            include: {
                appliedBy: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { appliedAt: "desc" },
        })

        return NextResponse.json(corrections)
    } catch (error) {
        console.error("List corrections error:", error)
        return NextResponse.json({ error: "Failed to fetch corrections" }, { status: 500 })
    }
}

// POST /api/classes/[id]/quizzes/[quizId]/corrections - Apply correction to all students
export async function POST(
    request: Request,
    { params }: { params: { id: string; quizId: string } }
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

        const body = await request.json()
        const { questionId, bonusPoints, reason } = body

        if (questionId === undefined || !reason) {
            return NextResponse.json(
                { error: "Question ID and reason are required" },
                { status: 400 }
            )
        }

        // Check if correction already exists for this question
        const existing = await prisma.questionCorrection.findUnique({
            where: {
                classQuizId_questionId: {
                    classQuizId: params.quizId,
                    questionId,
                },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: "Correction already exists for this question" },
                { status: 400 }
            )
        }

        // Get all submitted attempts
        const attempts = await prisma.classQuizAttempt.findMany({
            where: {
                classQuizId: params.quizId,
                status: "submitted",
            },
        })

        // Create correction record
        const correction = await prisma.questionCorrection.create({
            data: {
                classQuizId: params.quizId,
                questionId,
                bonusPoints: bonusPoints || 1,
                reason,
                appliedById: session.user.id,
            },
        })

        // Apply bonus points to all attempts
        let updatedCount = 0
        for (const attempt of attempts) {
            const newScore = Math.min(
                (attempt.score || 0) + (bonusPoints || 1),
                attempt.totalQuestions
            )
            const newPercentage = (newScore / attempt.totalQuestions) * 100

            await prisma.classQuizAttempt.update({
                where: { id: attempt.id },
                data: {
                    score: newScore,
                    percentage: newPercentage,
                },
            })

            // Create modification record for audit
            await prisma.scoreModification.create({
                data: {
                    attemptId: attempt.id,
                    originalScore: attempt.score || 0,
                    newScore,
                    reason: `Correction applied: ${reason}`,
                    modifiedById: session.user.id,
                },
            })

            updatedCount++
        }

        // Log admin action
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: "apply_correction",
                targetType: "quiz",
                targetId: params.quizId,
                details: {
                    questionId,
                    bonusPoints: bonusPoints || 1,
                    reason,
                    studentsAffected: updatedCount,
                },
            },
        })

        return NextResponse.json({
            message: `Correction applied to ${updatedCount} students`,
            correction,
        }, { status: 201 })
    } catch (error) {
        console.error("Apply correction error:", error)
        return NextResponse.json({ error: "Failed to apply correction" }, { status: 500 })
    }
}
