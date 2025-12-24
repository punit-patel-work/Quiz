import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/my-classes - List classes where user is a member (student)
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const memberships = await prisma.classMember.findMany({
            where: { userId: session.user.id },
            include: {
                class: {
                    include: {
                        teacher: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                        _count: {
                            select: {
                                members: true,
                                quizzes: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        attempts: true,
                    },
                },
            },
            orderBy: { joinedAt: "desc" },
        })

        // Get upcoming quizzes count for each class
        const now = new Date()
        const classesWithStats = await Promise.all(
            memberships.map(async (m) => {
                const upcomingQuizzes = await prisma.classQuiz.count({
                    where: {
                        classId: m.classId,
                        endTime: { gt: now },
                    },
                })

                const pendingQuizzes = await prisma.classQuiz.count({
                    where: {
                        classId: m.classId,
                        startTime: { lte: now },
                        endTime: { gt: now },
                        attempts: {
                            none: {
                                memberId: m.id,
                            },
                        },
                    },
                })

                return {
                    id: m.class.id,
                    name: m.class.name,
                    description: m.class.description,
                    code: m.class.code,
                    teacher: m.class.teacher,
                    role: m.role,
                    joinedAt: m.joinedAt,
                    memberCount: m.class._count.members,
                    totalQuizzes: m.class._count.quizzes,
                    upcomingQuizzes,
                    pendingQuizzes,
                    attemptedQuizzes: m._count.attempts,
                }
            })
        )

        return NextResponse.json(classesWithStats)
    } catch (error) {
        console.error("My classes fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch classes" },
            { status: 500 }
        )
    }
}
