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

        const userId = session.user.id

        // 1. Fetch user stats (total quizzes, average score, etc.)
        const stats = await prisma.quizResult.aggregate({
            where: { userId },
            _count: { id: true },
            _avg: { percentage: true },
            _max: { percentage: true },
        })

        const totalQuizzes = stats._count.id
        const averageScore = Math.round(stats._avg.percentage || 0)
        const bestScore = Math.round(stats._max.percentage || 0)

        // 2. Fetch pending quizzes from enrolled classes
        // A quiz is pending if:
        // - It belongs to a class the user is a member of
        // - The user has NOT submitted a result for it (or has attempts remaining)
        // - It is published

        const enrolledClasses = await prisma.classMember.findMany({
            where: { userId },
            select: { classId: true },
        })

        const classIds = enrolledClasses.map(c => c.classId)

        const now = new Date()

        const classQuizzes = await prisma.classQuiz.findMany({
            where: {
                classId: { in: classIds },
                startTime: { lte: now },
            },
            include: {
                class: {
                    select: {
                        name: true,
                    }
                },
                attempts: {
                    where: { member: { userId } },
                    select: { id: true }
                }
            }
        })

        const pendingQuizzes = classQuizzes.filter(cq => cq.attempts.length === 0).map(cq => ({
            id: cq.id,
            quizId: cq.id, // ClassQuiz ID serves as the identifier
            title: cq.name,
            class: cq.class.name,
            dueDate: cq.endTime,
            timeLimit: cq.duration,
        }))

        // 3. Fetch recent activity (recent results)
        const recentActivity = await prisma.quizResult.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                quizName: true,
                score: true,
                totalQuestions: true,
                percentage: true,
                createdAt: true,
                quizId: true,
            }
        })

        // Handle nullable quiz names for deleted quizzes
        const formattedActivity = recentActivity.map(activity => ({
            ...activity,
            quizName: activity.quizName || "Deleted Quiz"
        }))

        return NextResponse.json({
            stats: {
                totalQuizzes,
                averageScore,
                bestScore,
                pendingCount: pendingQuizzes.length,
            },
            pendingQuizzes,
            recentActivity: formattedActivity,
        })

    } catch (error) {
        console.error("Student stats error:", error)
        return NextResponse.json(
            { error: "Failed to fetch student stats" },
            { status: 500 }
        )
    }
}
