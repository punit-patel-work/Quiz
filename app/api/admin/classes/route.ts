import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/permissions"

// GET /api/admin/classes - List all classes
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
        const limit = parseInt(searchParams.get("limit") || "20")
        const search = searchParams.get("search") || ""

        const where = search ? {
            OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { code: { contains: search, mode: "insensitive" as const } },
            ],
        } : {}

        const [classes, total] = await Promise.all([
            prisma.class.findMany({
                where,
                include: {
                    teacher: {
                        select: { id: true, name: true, email: true },
                    },
                    _count: {
                        select: { members: true, quizzes: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.class.count({ where }),
        ])

        return NextResponse.json({
            classes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("Admin classes fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
    }
}

// DELETE /api/admin/classes - Delete a class
export async function DELETE(request: Request) {
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

        const { classId } = await request.json()

        await prisma.class.delete({
            where: { id: classId },
        })

        // Log action
        await prisma.adminLog.create({
            data: {
                action: "DELETE_CLASS",
                targetType: "class",
                targetId: classId,
                adminId: user.id,
                details: { classId },
            },
        })

        return NextResponse.json({ message: "Class deleted" })
    } catch (error) {
        console.error("Admin class delete error:", error)
        return NextResponse.json({ error: "Failed to delete class" }, { status: 500 })
    }
}
