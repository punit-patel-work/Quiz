import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Verify ownership before deleting
        const notification = await prisma.notification.findUnique({
            where: { id: params.id },
        })

        if (!notification) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (notification.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await prisma.notification.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete notification:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
