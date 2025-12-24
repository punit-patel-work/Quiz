import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canManageUsers, Roles } from "@/lib/permissions"

// GET /api/admin/users/[id] - Get user details
export async function GET(
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

        if (!currentUser || !canManageUsers(currentUser.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isApproved: true,
                isActive: true,
                approvedBy: true,
                approvedAt: true,
                createdAt: true,
                updatedAt: true,
                teacherClasses: {
                    select: {
                        id: true,
                        name: true,
                        _count: { select: { members: true, quizzes: true } },
                    },
                },
                classMembers: {
                    select: {
                        class: {
                            select: { id: true, name: true },
                        },
                        role: true,
                    },
                },
                teacherApplication: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error("Admin get user error:", error)
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }
}

// PUT /api/admin/users/[id] - Update user role/status
export async function PUT(
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

        if (!currentUser || !canManageUsers(currentUser.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Prevent self-demotion from admin
        if (params.id === session.user.id) {
            return NextResponse.json(
                { error: "Cannot modify your own account" },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { role, isActive, isApproved } = body

        // Validate role
        if (role && !Object.values(Roles).includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        const updateData: any = {}

        if (role !== undefined) {
            updateData.role = role
        }

        if (isActive !== undefined) {
            updateData.isActive = isActive
        }

        if (isApproved !== undefined) {
            updateData.isApproved = isApproved
            if (isApproved) {
                updateData.approvedBy = session.user.id
                updateData.approvedAt = new Date()
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isApproved: true,
                isActive: true,
            },
        })

        // Log the action
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: "update_user",
                targetType: "user",
                targetId: params.id,
                details: { changes: updateData },
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Admin update user error:", error)
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
}
