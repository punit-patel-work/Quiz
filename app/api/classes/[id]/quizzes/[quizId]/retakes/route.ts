import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { authorizeRetakes } from "@/lib/class-permissions"
import { logClassActivity } from "@/lib/class-activity"

// GET /api/classes/[id]/quizzes/[quizId]/retakes - List retakes
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string; quizId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user is authorized to manage retakes
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
            select: { teacherId: true },
        })

        const canManageRetakes = await authorizeRetakes(params.id, session.user.id)
        if (!classData || !canManageRetakes) {
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
    props: { params: Promise<{ id: string; quizId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user can manage retakes
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
            select: { teacherId: true, maxRetakes: true },
        })

        const canManageRetakes = await authorizeRetakes(params.id, session.user.id)
        if (!classData || !canManageRetakes) {
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

        // Log class action
        await logClassActivity({
            classId: params.id,
            actorId: session.user.id,
            action: "grant_retake",
            targetType: "member",
            targetId: type === "individual" ? memberId : params.id,
            details: { retakeId: retake.id, type, reason },
        })

        return NextResponse.json(retake, { status: 201 })
    } catch (error) {
        console.error("Grant retake error:", error)
        return NextResponse.json({ error: "Failed to grant retake" }, { status: 500 })
    }
}
