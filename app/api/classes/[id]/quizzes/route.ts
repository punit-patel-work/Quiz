import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/classes/[id]/quizzes - List class quizzes
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

        // Check if user has access (teacher or member)
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData) {
            return NextResponse.json(
                { error: "Class not found" },
                { status: 404 }
            )
        }

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

        const now = new Date()

        // If student, only show quizzes that have started
        const quizzes = await prisma.classQuiz.findMany({
            where: {
                classId: params.id,
                ...(isTeacher ? {} : { startTime: { lte: now } }),
            },
            include: {
                _count: {
                    select: { attempts: true },
                },
            },
            orderBy: { startTime: "desc" },
        })

        // If student, include their attempt status
        if (member) {
            const quizzesWithStatus = await Promise.all(
                quizzes.map(async (quiz) => {
                    // Find the latest attempt for this student
                    const attempts = await prisma.classQuizAttempt.findMany({
                        where: {
                            classQuizId: quiz.id,
                            memberId: member.id,
                        },
                        orderBy: { startedAt: "desc" },
                        take: 1,
                    })

                    const attempt = attempts[0] || null

                    return {
                        ...quiz,
                        totalQuestions: (quiz.questions as any[]).length,
                        attemptStatus: attempt?.status || null,
                        hasAttempted: !!attempt,
                        canAttempt: !attempt && quiz.endTime > now,
                        score: attempt?.score,
                        percentage: attempt?.percentage,
                    }
                })
            )

            return NextResponse.json(quizzesWithStatus)
        }

        return NextResponse.json(quizzes)
    } catch (error) {
        console.error("Class quizzes fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch quizzes" },
            { status: 500 }
        )
    }
}

// POST /api/classes/[id]/quizzes - Create a class quiz
export async function POST(
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

        // Verify teacher
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
                { error: "Only the teacher can create quizzes" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { name, description, questions, duration, startTime, endTime, showResults, shuffleQuestions } = body

        // Validate required fields
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Quiz name is required" },
                { status: 400 }
            )
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json(
                { error: "At least one question is required" },
                { status: 400 }
            )
        }

        if (!duration || duration < 1) {
            return NextResponse.json(
                { error: "Duration must be at least 1 minute" },
                { status: 400 }
            )
        }

        if (!startTime || !endTime) {
            return NextResponse.json(
                { error: "Start time and end time are required" },
                { status: 400 }
            )
        }

        const start = new Date(startTime)
        const end = new Date(endTime)

        if (end <= start) {
            return NextResponse.json(
                { error: "End time must be after start time" },
                { status: 400 }
            )
        }

        const quiz = await prisma.classQuiz.create({
            data: {
                classId: params.id,
                name: name.trim(),
                description: description?.trim() || null,
                questions,
                duration,
                startTime: start,
                endTime: end,
                showResults: showResults ?? true,
                shuffleQuestions: shuffleQuestions ?? false,
            },
        })

        return NextResponse.json(quiz, { status: 201 })
    } catch (error) {
        console.error("Quiz creation error:", error)
        return NextResponse.json(
            { error: "Failed to create quiz" },
            { status: 500 }
        )
    }
}
