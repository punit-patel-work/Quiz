import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canAccessAdmin } from "@/lib/permissions"

// GET /api/admin/stats - Get dashboard statistics
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user's role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (!user || !canAccessAdmin(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Get statistics
        const [
            totalUsers,
            totalTeachers,
            totalStudents,
            totalAdmins,
            pendingApplications,
            totalClasses,
            totalQuizzes,
            recentApplications,
            recentLogs,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: "teacher" } }),
            prisma.user.count({ where: { role: "student" } }),
            prisma.user.count({ where: { role: "admin" } }),
            prisma.teacherApplication.count({ where: { status: "pending" } }),
            prisma.class.count(),
            prisma.classQuiz.count(),
            prisma.teacherApplication.findMany({
                where: { status: "pending" },
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: { email: true, name: true, createdAt: true },
                    },
                },
            }),
            prisma.adminLog.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                include: {
                    admin: {
                        select: { email: true, name: true },
                    },
                },
            }),
        ])

        return NextResponse.json({
            stats: {
                totalUsers,
                totalTeachers,
                totalStudents,
                totalAdmins,
                pendingApplications,
                totalClasses,
                totalQuizzes,
            },
            recentApplications,
            recentLogs,
        })
    } catch (error) {
        console.error("Admin stats error:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
