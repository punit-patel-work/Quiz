import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canManageUsers } from "@/lib/permissions"

// GET /api/admin/users - List all users with pagination and filtering
export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (!currentUser || !canManageUsers(currentUser.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const search = searchParams.get("search") || ""
        const role = searchParams.get("role") || ""
        const status = searchParams.get("status") || "" // "active", "inactive", "pending"

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
            ]
        }

        if (role) {
            where.role = role
        }

        if (status === "active") {
            where.isActive = true
        } else if (status === "inactive") {
            where.isActive = false
        } else if (status === "pending") {
            where.isApproved = false
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isApproved: true,
                    isActive: true,
                    createdAt: true,
                    _count: {
                        select: {
                            teacherClasses: true,
                            classMembers: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ])

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("Admin users list error:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}
