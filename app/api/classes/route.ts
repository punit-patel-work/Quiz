import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

// Helper to generate unique 6-character class code
function generateClassCode(): string {
    return nanoid(6).toUpperCase()
}

// GET /api/classes - List classes where user is teacher
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const classes = await prisma.class.findMany({
            where: { teacherId: session.user.id },
            include: {
                _count: {
                    select: {
                        members: true,
                        quizzes: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(classes)
    } catch (error) {
        console.error("Classes fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch classes" },
            { status: 500 }
        )
    }
}

// POST /api/classes - Create a new class
export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
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

        if (name.length > 100) {
            return NextResponse.json(
                { error: "Class name must be 100 characters or less" },
                { status: 400 }
            )
        }

        // Generate unique class code
        let code = generateClassCode()
        let codeExists = await prisma.class.findUnique({ where: { code } })

        // Retry if code already exists (very unlikely)
        while (codeExists) {
            code = generateClassCode()
            codeExists = await prisma.class.findUnique({ where: { code } })
        }

        const newClass = await prisma.class.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                code,
                teacherId: session.user.id,
            },
        })

        return NextResponse.json(newClass, { status: 201 })
    } catch (error) {
        console.error("Class creation error:", error)
        return NextResponse.json(
            { error: "Failed to create class" },
            { status: 500 }
        )
    }
}
