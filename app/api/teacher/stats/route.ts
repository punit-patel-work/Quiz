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

        // 1. Get User's Classes
        const classes = await prisma.class.findMany({
            where: { teacherId: userId },
            include: {
                _count: {
                    select: {
                        members: true,
                        quizzes: true,
                    }
                }
            }
        })

        const totalClasses = classes.length

        // Sum of all members across all classes (note: could include duplicates if a student is in multiple classes)
        // For dashboard overview, sum of enrollments is usually acceptable/expected
        const totalStudents = classes.reduce((sum, cls) => sum + cls._count.members, 0)

        const totalQuizzesCreated = classes.reduce((sum, cls) => sum + cls._count.quizzes, 0)

        // 2. Get Active Quizzes (Quizzes that are currently running)
        const now = new Date()
        const activeQuizzesCount = await prisma.classQuiz.count({
            where: {
                class: { teacherId: userId },
                startTime: { lte: now },
                endTime: { gt: now },
            }
        })

        // 3. Get Recent Submissions (Across all classes taught by this teacher)
        const recentSubmissions = await prisma.classQuizAttempt.findMany({
            where: {
                classQuiz: {
                    class: { teacherId: userId }
                },
                status: "submitted"
            },
            take: 5,
            orderBy: { submittedAt: "desc" },
            include: {
                member: {
                    include: {
                        user: { select: { name: true, image: true } }
                    }
                },
                classQuiz: { select: { name: true, class: { select: { name: true } } } }
            }
        })

        const formattedSubmissions = recentSubmissions.map(sub => ({
            id: sub.id,
            studentName: sub.member.user.name || "Unknown Student",
            quizTitle: sub.classQuiz.name,
            className: sub.classQuiz.class.name,
            score: sub.score,
            totalQuestions: sub.totalQuestions,
            submittedAt: sub.submittedAt,
        }))

        return NextResponse.json({
            stats: {
                totalClasses,
                totalStudents,
                totalQuizzesCreated,
                activeQuizzesCount
            },
            recentSubmissions: formattedSubmissions
        })

    } catch (error) {
        console.error("Teacher stats error:", error)
        return NextResponse.json(
            { error: "Failed to fetch teacher stats" },
            { status: 500 }
        )
    }
}
