import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { calculateScore } from "@/lib/scoring"

// POST /api/my-classes/[id]/quizzes/[quizId]/submit - Submit quiz answers
export async function POST(
    request: Request,
    props: { params: Promise<{ id: string; quizId: string }> }
) {
    const params = await props.params;
    try {
        console.log("Submit quiz - Starting for classId:", params.id, "quizId:", params.quizId)

        const session = await auth()

        if (!session?.user) {
            console.log("Submit quiz - Unauthorized")
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

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
            console.log("Submit quiz - Not a member")
            return NextResponse.json(
                { error: "You are not a member of this class" },
                { status: 403 }
            )
        }

        // Get quiz
        const quiz = await prisma.classQuiz.findUnique({
            where: { id: params.quizId },
        })

        if (!quiz || quiz.classId !== params.id) {
            console.log("Submit quiz - Quiz not found")
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            )
        }

        // Get attempt
        const attempt = await prisma.classQuizAttempt.findFirst({
            where: {
                classQuizId: params.quizId,
                memberId: member.id,
                status: "in_progress",
            },
        })

        if (!attempt) {
            console.log("Submit quiz - No attempt found")
            return NextResponse.json(
                { error: "No attempt found. Please start the quiz first." },
                { status: 400 }
            )
        }

        if (attempt.status !== "in_progress") {
            console.log("Submit quiz - Already submitted, status:", attempt.status)
            return NextResponse.json(
                { error: "This quiz has already been submitted" },
                { status: 400 }
            )
        }

        const now = new Date()
        const body = await request.json()
        const { userAnswers, autoSubmit } = body

        console.log("Submit quiz - userAnswers count:", userAnswers?.length || 0)

        // Check if submission is past deadline
        const isPastDeadline = now > quiz.endTime
        const autoSubmitted = autoSubmit || isPastDeadline

        // Calculate score
        const questions = quiz.questions as any[]
        console.log("Submit quiz - questions count:", questions.length)

        const answersMap = new Map<number, string | boolean | null>(
            (userAnswers || []).map((item: any) => [Number(item.questionId), item.userAnswer])
        )

        const results = calculateScore(questions, answersMap)
        console.log("Submit quiz - calculated score:", results.score, "/", results.totalQuestions, "hasDescriptive:", results.hasDescriptive)

        // Optimize answers for storage
        const optimizedAnswers = (userAnswers || []).map((item: any) => ({
            questionId: item.questionId,
            answer: item.userAnswer,
        }))

        // Determine grading status
        const gradingStatus = results.hasDescriptive ? "pending" : "none"

        // Update attempt
        const updatedAttempt = await prisma.classQuizAttempt.update({
            where: { id: attempt.id },
            data: {
                score: results.score,
                percentage: results.percentage,
                userAnswers: optimizedAnswers,
                submittedAt: now,
                autoSubmitted,
                status: "submitted",
                gradingStatus,
            },
        })

        console.log("Submit quiz - Success, updated attempt:", updatedAttempt.id, "gradingStatus:", gradingStatus)

        return NextResponse.json({
            message: autoSubmitted ? "Quiz auto-submitted due to deadline" : "Quiz submitted successfully",
            result: {
                score: results.score,
                totalQuestions: results.totalQuestions,
                percentage: results.percentage,
                autoSubmitted,
                showResults: gradingStatus === "pending" ? false : quiz.showResults,
                hasDescriptive: results.hasDescriptive,
                gradingStatus,
            },
        })
    } catch (error) {
        console.error("Submit quiz error:", error)
        return NextResponse.json(
            { error: "Failed to submit quiz" },
            { status: 500 }
        )
    }
}
