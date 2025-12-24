import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canGrantRetakes } from "@/lib/permissions"

// GET /api/classes/[id]/quizzes/[quizId]/retakes - List retakes
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

        const retakes = await prisma.quizRetake.findMany({
            where: { classQuizId: params.quizId },
            include: {
                member: {
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                },
                grantedBy: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { grantedAt: "desc" },
        })

        return NextResponse.json(retakes)
    } catch (error) {
        console.error("List retakes error:", error)
        return NextResponse.json({ error: "Failed to fetch retakes" }, { status: 500 })
    }
}

// POST /api/classes/[id]/quizzes/[quizId]/retakes - Grant retake
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
            select: { teacherId: true, maxRetakes: true },
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const { type, memberId, expiresAt, reason } = body

        if (!type || !expiresAt) {
            return NextResponse.json(
                { error: "Type and expiration date required" },
                { status: 400 }
            )
        }

        if (type === "individual" && !memberId) {
            return NextResponse.json(
                { error: "Member ID required for individual retake" },
                { status: 400 }
            )
        }

        // For class-wide retakes, check max limit
        if (type === "class_wide") {
            const existingClassRetakes = await prisma.quizRetake.count({
                where: {
                    classQuizId: params.quizId,
                    type: "class_wide",
                },
            })

            if (existingClassRetakes >= classData.maxRetakes) {
                return NextResponse.json(
                    { error: `Maximum ${classData.maxRetakes} class-wide retakes allowed` },
                    { status: 400 }
                )
            }
        }

        const retake = await prisma.quizRetake.create({
            data: {
                classQuizId: params.quizId,
                memberId: type === "individual" ? memberId : null,
                type,
                grantedById: session.user.id,
                expiresAt: new Date(expiresAt),
                reason,
            },
        })

        // Log admin action
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: "grant_retake",
                targetType: "quiz",
                targetId: params.quizId,
                details: { retakeId: retake.id, type, memberId, reason },
            },
        })

        return NextResponse.json(retake, { status: 201 })
    } catch (error) {
        console.error("Grant retake error:", error)
        return NextResponse.json({ error: "Failed to grant retake" }, { status: 500 })
    }
}
