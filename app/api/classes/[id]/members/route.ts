import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/classes/[id]/members - List class members
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

        // Check if user is teacher
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData) {
            return NextResponse.json(
                { error: "Class not found" },
                { status: 404 }
            )
        }

        if (classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the teacher can view members" },
                { status: 403 }
            )
        }

        const members = await prisma.classMember.findMany({
            where: { classId: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        attempts: true,
                    },
                },
            },
            orderBy: { joinedAt: "asc" },
        })

        // Get quiz count for attempt stats
        const quizCount = await prisma.classQuiz.count({
            where: { classId: params.id },
        })

        const formattedMembers = members.map((member) => ({
            id: member.id,
            userId: member.userId,
            name: member.user.name,
            email: member.user.email,
            role: member.role,
            joinedAt: member.joinedAt,
            quizzesAttempted: member._count.attempts,
            totalQuizzes: quizCount,
        }))

        return NextResponse.json(formattedMembers)
    } catch (error) {
        console.error("Members fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch members" },
            { status: 500 }
        )
    }
}
