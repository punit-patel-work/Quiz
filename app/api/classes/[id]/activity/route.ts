import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/classes/[id]/activity - List class activity log
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
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
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the teacher can view activity logs" },
                { status: 403 }
            )
        }

        const activities = await prisma.classActivityLog.findMany({
            where: { classId: params.id },
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 100 // Limit to 100 for now to prevent bloating
        })

        return NextResponse.json(activities)
    } catch (error) {
        console.error("Activity fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch activities" },
            { status: 500 }
        )
    }
}
