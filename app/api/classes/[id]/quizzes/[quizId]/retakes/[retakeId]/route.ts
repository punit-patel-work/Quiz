import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { authorizeRetakes } from "@/lib/class-permissions"
import { logClassActivity } from "@/lib/class-activity"

// DELETE /api/classes/[id]/quizzes/[quizId]/retakes/[retakeId] - Revoke retake
export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string; quizId: string; retakeId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check authorizations
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
            select: { teacherId: true },
        })

        const canManageRetakes = await authorizeRetakes(params.id, session.user.id)
        if (!classData || !canManageRetakes) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const retake = await prisma.quizRetake.findUnique({
            where: { id: params.retakeId },
        })

        if (!retake) {
            return NextResponse.json({ error: "Retake not found" }, { status: 404 })
        }

        if (retake.used) {
            return NextResponse.json(
                { error: "Cannot revoke a used retake" },
                { status: 400 }
            )
        }

        await prisma.quizRetake.delete({
            where: { id: params.retakeId },
        })

        await logClassActivity({
            classId: params.id,
            actorId: session.user.id,
            action: "update_score", // Note: Using update_score as a generic grading/retake modifier action for now.
            targetType: "attempt", // Retakes relate to attempts conceptually.
            targetId: params.retakeId,
            details: { name: "Revoked Retake" }
        })

        return NextResponse.json({ message: "Retake revoked" })
    } catch (error) {
        console.error("Revoke retake error:", error)
        return NextResponse.json({ error: "Failed to revoke retake" }, { status: 500 })
    }
}
