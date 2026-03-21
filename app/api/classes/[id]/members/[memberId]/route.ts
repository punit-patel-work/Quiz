import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { logClassActivity } from "@/lib/class-activity"

// PATCH /api/classes/[id]/members/[memberId] - Update member role (e.g. Make TA)
export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string; memberId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { role } = body 

        if (role !== "student" && role !== "assistant") {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json({ error: "Only the teacher can modify roles" }, { status: 403 })
        }

        const member = await prisma.classMember.findUnique({
            where: { id: params.memberId },
        })

        if (!member || member.classId !== params.id) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 })
        }

        const updatedMember = await prisma.classMember.update({
            where: { id: params.memberId },
            data: { role },
        })

        await logClassActivity({
            classId: params.id,
            actorId: session.user.id,
            action: role === "assistant" ? "make_ta" : "remove_ta",
            targetType: "member",
            targetId: params.memberId,
            details: { previousRole: member.role, newRole: role }
        })

        return NextResponse.json({ message: "Role updated successfully", member: updatedMember })
    } catch (error) {
        console.error("Member role update error:", error)
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
    }
}

// DELETE /api/classes/[id]/members/[memberId] - Remove member from class
export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string; memberId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Check if user is teacher
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
                { error: "Only the teacher can remove members" },
                { status: 403 }
            )
        }

        // Check if member exists
        const member = await prisma.classMember.findUnique({
            where: { id: params.memberId },
        })

        if (!member) {
            return NextResponse.json(
                { error: "Member not found" },
                { status: 404 }
            )
        }

        if (member.classId !== params.id) {
            return NextResponse.json(
                { error: "Member does not belong to this class" },
                { status: 400 }
            )
        }

        await prisma.classMember.delete({
            where: { id: params.memberId },
        })

        return NextResponse.json({ message: "Member removed successfully" })
    } catch (error) {
        console.error("Member removal error:", error)
        return NextResponse.json(
            { error: "Failed to remove member" },
            { status: 500 }
        )
    }
}
