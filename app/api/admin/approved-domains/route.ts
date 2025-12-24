import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canManageDomains } from "@/lib/permissions"

// GET /api/admin/approved-domains - List approved domains
export async function GET() {
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

        const domains = await prisma.approvedDomain.findMany({
            orderBy: { addedAt: "desc" },
        })

        return NextResponse.json(domains)
    } catch (error) {
        console.error("List domains error:", error)
        return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 })
    }
}

// POST /api/admin/approved-domains - Add approved domain
export async function POST(request: Request) {
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

        const body = await request.json()
        let { domain, note } = body

        if (!domain) {
            return NextResponse.json({ error: "Domain is required" }, { status: 400 })
        }

        // Normalize domain format (ensure it starts with @)
        if (!domain.startsWith("@")) {
            domain = "@" + domain
        }

        // Check for duplicate
        const existing = await prisma.approvedDomain.findUnique({
            where: { domain },
        })

        if (existing) {
            return NextResponse.json({ error: "Domain already exists" }, { status: 400 })
        }

        const newDomain = await prisma.approvedDomain.create({
            data: {
                domain,
                note,
                addedBy: session.user.id,
            },
        })

        // Log the action
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: "add_approved_domain",
                targetType: "domain",
                targetId: newDomain.id,
                details: { domain, note },
            },
        })

        return NextResponse.json(newDomain, { status: 201 })
    } catch (error) {
        console.error("Add domain error:", error)
        return NextResponse.json({ error: "Failed to add domain" }, { status: 500 })
    }
}
