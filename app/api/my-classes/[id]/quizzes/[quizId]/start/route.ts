import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// POST /api/my-classes/[id]/quizzes/[quizId]/start - Start a quiz attempt
export async function POST(
    request: Request,
    { params }: { params: { id: string; quizId: string } }
) {
    try {
        console.log("Start quiz - classId:", params.id, "quizId:", params.quizId)

        const session = await auth()

        if (!session?.user) {
            console.log("Start quiz - Unauthorized")
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        console.log("Start quiz - userId:", session.user.id)

        // Get member
        const member = await prisma.classMember.findUnique({
            where: {
                classId_userId: {
                    classId: params.id,
                    userId: session.user.id,
                },
            },
        })

        if (!member) {
            console.log("Start quiz - Not a member of this class")
            return NextResponse.json(
                { error: "You are not a member of this class" },
                { status: 403 }
            )
        }

        console.log("Start quiz - memberId:", member.id)

        // Get quiz
        const quiz = await prisma.classQuiz.findUnique({
            where: { id: params.quizId },
        })

        if (!quiz || quiz.classId !== params.id) {
            console.log("Start quiz - Quiz not found or wrong class")
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            )
        }

        console.log("Start quiz - quiz found:", quiz.name)

        const now = new Date()

        // Check if quiz is available
        if (quiz.startTime > now) {
            console.log("Start quiz - Not started yet. Start time:", quiz.startTime, "Now:", now)
            return NextResponse.json(
                { error: "Quiz has not started yet" },
                { status: 400 }
            )
        }

        if (quiz.endTime < now) {
            console.log("Start quiz - Deadline passed. End time:", quiz.endTime, "Now:", now)
            return NextResponse.json(
                { error: "Quiz deadline has passed" },
                { status: 400 }
            )
        }

        // Check if already attempted
        const existingAttempt = await prisma.classQuizAttempt.findFirst({
            where: {
                classQuizId: params.quizId,
                memberId: member.id,
            },
            orderBy: { startedAt: "desc" },
        })

        if (existingAttempt) {
            console.log("Start quiz - Existing attempt found, status:", existingAttempt.status)

            // If in progress, return the existing attempt
            if (existingAttempt.status === "in_progress") {
                // Calculate remaining time
                const attemptStartTime = existingAttempt.startedAt.getTime()
                const durationMs = quiz.duration * 60 * 1000
                const attemptEndTime = Math.min(
                    attemptStartTime + durationMs,
                    quiz.endTime.getTime()
                )
                const remainingSeconds = Math.max(0, Math.floor((attemptEndTime - now.getTime()) / 1000))

                console.log("Start quiz - Resuming, remaining seconds:", remainingSeconds)

                return NextResponse.json({
                    attempt: existingAttempt,
                    quiz: {
                        id: quiz.id,
                        name: quiz.name,
                        description: quiz.description,
                        questions: quiz.questions,
                        duration: quiz.duration,
                        endTime: quiz.endTime,
                        shuffleQuestions: quiz.shuffleQuestions,
                    },
                    remainingSeconds,
                    resuming: true,
                })
            }

            // Check for active retake (individual or class-wide)
            const activeRetake = await prisma.quizRetake.findFirst({
                where: {
                    classQuizId: params.quizId,
                    expiresAt: { gt: now },
                    used: false,
                    OR: [
                        { memberId: member.id },
                        { memberId: null }, // Class-wide retake
                    ],
                },
            })

            if (!activeRetake) {
                return NextResponse.json(
                    { error: "You have already completed this quiz" },
                    { status: 400 }
                )
            }

            // Mark retake as used
            await prisma.quizRetake.update({
                where: { id: activeRetake.id },
                data: { used: true, usedAt: now },
            })

            console.log("Start quiz - Using retake:", activeRetake.id)
        }

        // Check if there's enough time to complete
        const timeUntilDeadline = (quiz.endTime.getTime() - now.getTime()) / 1000 / 60
        if (timeUntilDeadline < 1) {
            console.log("Start quiz - Not enough time, minutes left:", timeUntilDeadline)
            return NextResponse.json(
                { error: "Not enough time remaining before deadline" },
                { status: 400 }
            )
        }

        // Create attempt
        const questions = quiz.questions as any[]
        console.log("Start quiz - Creating attempt, question count:", questions.length)

        const attempt = await prisma.classQuizAttempt.create({
            data: {
                classQuizId: params.quizId,
                memberId: member.id,
                totalQuestions: questions.length,
                status: "in_progress",
            },
        })

        console.log("Start quiz - Attempt created:", attempt.id)

        // Calculate actual time available (minimum of duration and time until deadline)
        const effectiveDuration = Math.min(quiz.duration, timeUntilDeadline)
        const remainingSeconds = Math.floor(effectiveDuration * 60)

        return NextResponse.json({
            attempt,
            quiz: {
                id: quiz.id,
                name: quiz.name,
                description: quiz.description,
                questions: quiz.shuffleQuestions ? shuffleArray(questions) : questions,
                duration: quiz.duration,
                endTime: quiz.endTime,
                shuffleQuestions: quiz.shuffleQuestions,
            },
            remainingSeconds,
            resuming: false,
        })
    } catch (error) {
        console.error("Start quiz error:", error)
        return NextResponse.json(
            { error: "Failed to start quiz" },
            { status: 500 }
        )
    }
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}
