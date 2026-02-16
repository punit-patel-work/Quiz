import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/notifications - Fetch user's notifications
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20, // Limit to recent 20
        })

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                isRead: false
            }
        })

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error("Notifications fetch error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// PATCH /api/notifications - Mark all as read
export async function PATCH() {
    try {
        const session = await auth()
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                isRead: false
            },
            data: { isRead: true }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Notifications update error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
