import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createClassNotification } from "@/lib/notifications"

// GET /api/classes/[id]/quizzes - List class quizzes
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

        // If student, include their attempt status and retake availability
        if (member) {
            const quizzesWithStatus = await Promise.all(
                quizzes.map(async (quiz) => {
                    // Fetch all attempts to determine best score and attempt count
                    const attempts = await prisma.classQuizAttempt.findMany({
                        where: {
                            classQuizId: quiz.id,
                            memberId: member.id,
                        },
                        orderBy: { startedAt: "desc" },
                    })

                    const latestAttempt = attempts[0] || null

                    // Find best submitted attempt
                    const bestAttempt = attempts
                        .filter(a => a.status === "submitted" && a.percentage !== null)
                        .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0]

                    // Check for active retake (individual or class-wide)
                    let hasRetake = false
                    if (latestAttempt?.status === "submitted") {
                        const activeRetake = await prisma.quizRetake.findFirst({
                            where: {
                                classQuizId: quiz.id,
                                expiresAt: { gt: now },
                                used: false,
                                OR: [
                                    { memberId: member.id },
                                    { memberId: null }, // Class-wide retake
                                ],
                            },
                        })
                        hasRetake = !!activeRetake
                    }

                    // Can attempt if: 
                    // 1. No attempts yet
                    // 2. Attempts < Max Attempts (and latest is submitted)
                    // 3. Has specific retake granted
                    // 4. Latest is in_progress (can resume)

                    const maxAttempts = quiz.maxAttempts || 1
                    const attemptsCount = attempts.length

                    const canAttempt =
                        (quiz.endTime > now && (
                            !latestAttempt ||
                            (attemptsCount < maxAttempts && latestAttempt.status === "submitted") ||
                            latestAttempt.status === "in_progress"
                        )) || hasRetake

                    return {
                        ...quiz,
                        totalQuestions: (quiz.questions as any[]).length,
                        attemptStatus: latestAttempt?.status || null,
                        hasAttempted: attempts.length > 0,
                        canAttempt,
                        hasRetake,
                        // Return BEST score, or latest if no best (fallback), or null
                        score: bestAttempt?.score ?? latestAttempt?.score,
                        percentage: bestAttempt?.percentage ?? latestAttempt?.percentage,
                        attemptsTaken: attemptsCount,
                        maxAttempts
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
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
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
                maxAttempts: body.maxAttempts || 1,
            },
        })

        // Notify class members
        await createClassNotification({
            classId: params.id,
            title: "New Quiz Assigned",
            message: `A new quiz "${quiz.name}" has been assigned in ${classData.name}.`,
            type: "INFO",
            link: `/my-classes/${params.id}/quiz/${quiz.id}`,
            excludeUserId: session.user.id,
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
