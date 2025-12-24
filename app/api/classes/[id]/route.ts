import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/classes/[id] - Get class details
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const classData = await prisma.class.findUnique({
            where: { id: params.id },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        quizzes: true,
                        invitations: {
                            where: { status: "pending" },
                        },
                    },
                },
            },
        })

        if (!classData) {
            return NextResponse.json(
                { error: "Class not found" },
                { status: 404 }
            )
        }

        // Check if user is teacher or member
        const isTeacher = classData.teacherId === session.user.id
        const member = await prisma.classMember.findUnique({
            where: {
                classId_userId: {
                    classId: params.id,
                    userId: session.user.id,
                },
            },
        })

        if (!isTeacher && !member) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        return NextResponse.json({
            ...classData,
            isTeacher,
            memberRole: member?.role || null,
        })
    } catch (error) {
        console.error("Class fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch class" },
            { status: 500 }
        )
    }
}

// PUT /api/classes/[id] - Update class
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verify ownership
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData) {
            return NextResponse.json(
                { error: "Class not found" },
                { status: 404 }
            )
        }

        if (classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the teacher can update this class" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { name, description } = body

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Class name is required" },
                { status: 400 }
            )
        }

        const updatedClass = await prisma.class.update({
            where: { id: params.id },
            data: {
                name: name.trim(),
                description: description?.trim() || null,
            },
        })

        return NextResponse.json(updatedClass)
    } catch (error) {
        console.error("Class update error:", error)
        return NextResponse.json(
            { error: "Failed to update class" },
            { status: 500 }
        )
    }
}

// DELETE /api/classes/[id] - Delete class
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verify ownership
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData) {
            return NextResponse.json(
                { error: "Class not found" },
                { status: 404 }
            )
        }

        if (classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the teacher can delete this class" },
                { status: 403 }
            )
        }

        await prisma.class.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ message: "Class deleted successfully" })
    } catch (error) {
        console.error("Class deletion error:", error)
        return NextResponse.json(
            { error: "Failed to delete class" },
            { status: 500 }
        )
    }
}
