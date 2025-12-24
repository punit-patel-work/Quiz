import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/teacher-application - Get user's application status
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const application = await prisma.teacherApplication.findUnique({
            where: { userId: session.user.id },
        })

        return NextResponse.json(application)
    } catch (error) {
        console.error("Get application error:", error)
        return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
    }
}

// POST /api/teacher-application - Submit teacher application
export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check current user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, email: true },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        if (user.role === "teacher" || user.role === "admin") {
            return NextResponse.json(
                { error: "You are already a teacher or admin" },
                { status: 400 }
            )
        }

        // Check for existing application
        const existing = await prisma.teacherApplication.findUnique({
            where: { userId: session.user.id },
        })

        if (existing) {
            if (existing.status === "pending") {
                return NextResponse.json(
                    { error: "You already have a pending application" },
                    { status: 400 }
                )
            }
            if (existing.status === "rejected") {
                // Allow reapplying after rejection
                await prisma.teacherApplication.delete({
                    where: { id: existing.id },
                })
            }
        }

        const body = await request.json()
        const { institution, reason } = body

        if (!institution || !reason) {
            return NextResponse.json(
                { error: "Institution and reason are required" },
                { status: 400 }
            )
        }

        // Check for auto-approval via approved domains
        const emailDomain = "@" + user.email.split("@")[1]
        const approvedDomain = await prisma.approvedDomain.findUnique({
            where: { domain: emailDomain },
        })

        if (approvedDomain) {
            // Auto-approve
            await prisma.$transaction([
                prisma.teacherApplication.create({
                    data: {
                        userId: session.user.id,
                        institution,
                        reason,
                        status: "approved",
                        reviewedAt: new Date(),
                        reviewNote: "Auto-approved via domain: " + emailDomain,
                    },
                }),
                prisma.user.update({
                    where: { id: session.user.id },
                    data: {
                        role: "teacher",
                        isApproved: true,
                        approvedAt: new Date(),
                    },
                }),
            ])

            return NextResponse.json({
                status: "approved",
                message: "Automatically approved! You can now create classes.",
            })
        }

        // Create pending application
        const application = await prisma.teacherApplication.create({
            data: {
                userId: session.user.id,
                institution,
                reason,
            },
        })

        return NextResponse.json({
            status: "pending",
            message: "Application submitted. An admin will review it soon.",
            application,
        })
    } catch (error) {
        console.error("Submit application error:", error)
        return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
    }
}
