import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canApproveTeachers } from "@/lib/permissions"

// POST /api/admin/teacher-applications/[id]/reject - Reject application
export async function POST(
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

        if (!currentUser || !canApproveTeachers(currentUser.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const application = await prisma.teacherApplication.findUnique({
            where: { id: params.id },
        })

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        if (application.status !== "pending") {
            return NextResponse.json(
                { error: "Application already processed" },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { reason } = body

        await prisma.$transaction([
            prisma.teacherApplication.update({
                where: { id: params.id },
                data: {
                    status: "rejected",
                    reviewedBy: session.user.id,
                    reviewedAt: new Date(),
                    reviewNote: reason,
                },
            }),
            prisma.adminLog.create({
                data: {
                    adminId: session.user.id,
                    action: "reject_teacher",
                    targetType: "user",
                    targetId: application.userId,
                    details: {
                        applicationId: params.id,
                        reason,
                    },
                },
            }),
        ])

        return NextResponse.json({ message: "Application rejected" })
    } catch (error) {
        console.error("Reject application error:", error)
        return NextResponse.json({ error: "Failed to reject" }, { status: 500 })
    }
}
