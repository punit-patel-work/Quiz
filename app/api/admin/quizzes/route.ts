import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/permissions"

// GET /api/admin/quizzes - List all quizzes
export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const search = searchParams.get("search") || ""
        const status = searchParams.get("status") || "all" // all, active, upcoming, past

        const now = new Date()
        let where: any = {}

        if (search) {
            where.name = { contains: search, mode: "insensitive" }
        }

        if (status === "active") {
            where.startTime = { lte: now }
            where.endTime = { gt: now }
        } else if (status === "upcoming") {
            where.startTime = { gt: now }
        } else if (status === "past") {
            where.endTime = { lte: now }
        }

        const [quizzes, total] = await Promise.all([
            prisma.classQuiz.findMany({
                where,
                include: {
                    class: {
                        select: { id: true, name: true, teacher: { select: { name: true, email: true } } },
                    },
                    _count: {
                        select: { attempts: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.classQuiz.count({ where }),
        ])

        return NextResponse.json({
            quizzes: quizzes.map(q => ({
                ...q,
                questions: undefined, // Don't send questions to admin list
                questionCount: (q.questions as any[]).length,
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("Admin quizzes fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
    }
}
