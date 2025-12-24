import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/invitations/[id]/accept - Accept an invitation
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
            include: { class: true },
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

        // Check if expired
        if (invitation.expiresAt < new Date()) {
            await prisma.classInvitation.update({
                where: { id: params.id },
                data: { status: "expired" },
            })
            return NextResponse.json(
                { error: "This invitation has expired" },
                { status: 410 }
            )
        }

        // Check if already a member
        const existingMember = await prisma.classMember.findUnique({
            where: {
                classId_userId: {
                    classId: invitation.classId,
                    userId: session.user.id,
                },
            },
        })

        if (existingMember) {
            await prisma.classInvitation.update({
                where: { id: params.id },
                data: { status: "accepted" },
            })
            return NextResponse.json(
                { error: "You are already a member of this class" },
                { status: 400 }
            )
        }

        // Add as member and update invitation
        await prisma.$transaction([
            prisma.classMember.create({
                data: {
                    classId: invitation.classId,
                    userId: session.user.id,
                    role: "student",
                },
            }),
            prisma.classInvitation.update({
                where: { id: params.id },
                data: { status: "accepted" },
            }),
        ])

        return NextResponse.json({
            message: "Invitation accepted",
            classId: invitation.classId,
            className: invitation.class.name,
        })
    } catch (error) {
        console.error("Accept invitation error:", error)
        return NextResponse.json(
            { error: "Failed to accept invitation" },
            { status: 500 }
        )
    }
}
