import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canApproveTeachers } from "@/lib/permissions"

// GET /api/admin/teacher-applications - List teacher applications
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

        if (!currentUser || !canApproveTeachers(currentUser.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status") || "pending"

        const applications = await prisma.teacherApplication.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                    },
                },
            },
        })

        return NextResponse.json(applications)
    } catch (error) {
        console.error("List applications error:", error)
        return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }
}
