import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/invitations - Get user's pending invitations
export async function GET() {
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

        // Find pending invitations for this email
        const invitations = await prisma.classInvitation.findMany({
            where: {
                email: user.email,
                status: "pending",
                expiresAt: { gt: new Date() },
            },
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
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(invitations)
    } catch (error) {
        console.error("Invitations fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch invitations" },
            { status: 500 }
        )
    }
}
