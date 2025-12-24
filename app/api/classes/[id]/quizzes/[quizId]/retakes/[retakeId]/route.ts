import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/classes/[id]/quizzes/[quizId]/retakes/[retakeId] - Revoke retake
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; quizId: string; retakeId: string } }
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

        return NextResponse.json({ message: "Retake revoked" })
    } catch (error) {
        console.error("Revoke retake error:", error)
        return NextResponse.json({ error: "Failed to revoke retake" }, { status: 500 })
    }
}
