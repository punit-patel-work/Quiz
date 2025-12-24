import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/classes/[id]/members/[memberId] - Remove member from class
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; memberId: string } }
) {
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
