import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canManageDomains } from "@/lib/permissions"

// DELETE /api/admin/approved-domains/[id] - Remove approved domain
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (!currentUser || !canManageDomains(currentUser.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const domain = await prisma.approvedDomain.findUnique({
            where: { id: params.id },
        })

        if (!domain) {
            return NextResponse.json({ error: "Domain not found" }, { status: 404 })
        }

        await prisma.approvedDomain.delete({
            where: { id: params.id },
        })

        // Log the action
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: "remove_approved_domain",
                targetType: "domain",
                targetId: params.id,
                details: { domain: domain.domain },
            },
        })

        return NextResponse.json({ message: "Domain removed" })
    } catch (error) {
        console.error("Delete domain error:", error)
        return NextResponse.json({ error: "Failed to delete domain" }, { status: 500 })
    }
}
