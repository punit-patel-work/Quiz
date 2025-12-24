import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canApproveTeachers } from "@/lib/permissions"

// POST /api/admin/teacher-applications/[id]/approve - Approve application
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
            include: { user: true },
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

        // Update application and user in transaction
        await prisma.$transaction([
            prisma.teacherApplication.update({
                where: { id: params.id },
                data: {
                    status: "approved",
                    reviewedBy: session.user.id,
                    reviewedAt: new Date(),
                },
            }),
            prisma.user.update({
                where: { id: application.userId },
                data: {
                    role: "teacher",
                    isApproved: true,
                    approvedBy: session.user.id,
                    approvedAt: new Date(),
                },
            }),
            prisma.adminLog.create({
                data: {
                    adminId: session.user.id,
                    action: "approve_teacher",
                    targetType: "user",
                    targetId: application.userId,
                    details: {
                        applicationId: params.id,
                        institution: application.institution,
                    },
                },
            }),
        ])

        return NextResponse.json({ message: "Application approved" })
    } catch (error) {
        console.error("Approve application error:", error)
        return NextResponse.json({ error: "Failed to approve" }, { status: 500 })
    }
}
