import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/invitations/[id]/reject - Reject an invitation
export async function POST(
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

        // Get user's email
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Find the invitation
        const invitation = await prisma.classInvitation.findUnique({
            where: { id: params.id },
        })

        if (!invitation) {
            return NextResponse.json(
                { error: "Invitation not found" },
                { status: 404 }
            )
        }

        // Verify email matches
        if (invitation.email !== user.email) {
            return NextResponse.json(
                { error: "This invitation is not for you" },
                { status: 403 }
            )
        }

        // Update invitation status
        await prisma.classInvitation.update({
            where: { id: params.id },
            data: { status: "rejected" },
        })

        return NextResponse.json({
            message: "Invitation rejected",
        })
    } catch (error) {
        console.error("Reject invitation error:", error)
        return NextResponse.json(
            { error: "Failed to reject invitation" },
            { status: 500 }
        )
    }
}
