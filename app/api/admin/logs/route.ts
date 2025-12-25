import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/permissions"

// GET /api/admin/logs - Get audit logs
export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "50")
        const action = searchParams.get("action") || ""

        const where = action ? { action: { contains: action, mode: "insensitive" as const } } : {}

        const [logs, total] = await Promise.all([
            prisma.adminLog.findMany({
                where,
                include: {
                    admin: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.adminLog.count({ where }),
        ])

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("Admin logs fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
    }
}
