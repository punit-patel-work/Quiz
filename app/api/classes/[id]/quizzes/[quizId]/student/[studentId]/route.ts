import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/classes/[id]/quizzes/[quizId]/student/[studentId] - Get student's detailed result (for teacher)
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string; quizId: string; studentId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify teacher owns the class
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        // Get quiz with questions
        const quiz = await prisma.classQuiz.findUnique({
            where: { id: params.quizId },
            select: {
                id: true,
                name: true,
                questions: true,
                classId: true,
            },
        })

        if (!quiz || quiz.classId !== params.id) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
        }

        // Get all attempts for this student
        const attempts = await prisma.classQuizAttempt.findMany({
            where: {
                classQuizId: params.quizId,
                memberId: params.studentId,
                status: "submitted",
            },
            orderBy: { submittedAt: "desc" },
            include: {
                member: {
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                },
            },
        })

        if (!attempts || attempts.length === 0) {
            return NextResponse.json({ error: "No result found" }, { status: 404 })
        }

        // Determine which attempt to show
        const url = new URL(request.url)
        const attemptId = url.searchParams.get("attemptId")

        let currentAttempt = attempts[0] // Default to latest

        if (attemptId) {
            const found = attempts.find(a => a.id === attemptId)
            if (found) currentAttempt = found
        } else {
            // Default to BEST attempt if not specified
            const best = [...attempts].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0]
            if (best) currentAttempt = best
        }

        // Build attempt summary list for dropdown
        const attemptsSummary = attempts.map(a => ({
            id: a.id,
            score: a.score,
            percentage: a.percentage,
            submittedAt: a.submittedAt,
            isBest: a.id === ([...attempts].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0]?.id)
        })).sort((a, b) => {
            const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
            const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
            return dateB - dateA
        })

        // Build detailed breakdown
        const questions = quiz.questions as any[]
        const userAnswers = (currentAttempt.userAnswers as any[]) || []

        // Create a map for quick lookup - key is the question's id
        const answerMap = new Map<number, any>()
        userAnswers.forEach((a: any) => {
            answerMap.set(Number(a.questionId), a.answer)
        })

        const detailedResults = questions.map((q, index) => {
            // Use q.id (the question's actual id) to lookup the answer
            const userAnswer = answerMap.get(q.id)
            let isCorrect = false
            let correctAnswer: any = null

            if (q.type === "multiple_choice") {
                // Options are plain strings, correct_answer is the correct option text
                correctAnswer = q.correct_answer
                isCorrect = userAnswer === q.correct_answer
            } else if (q.type === "true_false") {
                correctAnswer = q.correct_answer
                // Robust comparison for T/F (handle boolean/string mismatch)
                const correctStr = String(correctAnswer).toLowerCase()
                const userStr = String(userAnswer).toLowerCase()
                isCorrect = correctStr === userStr
            } else if (q.type === "fill_in_the_blank") {
                // Fill in the blank can have multiple correct answers
                const correctAnswers = Array.isArray(q.correct_answer)
                    ? q.correct_answer
                    : [q.correct_answer]
                correctAnswer = correctAnswers[0]
                isCorrect = correctAnswers.some((ans: string) =>
                    ans.toLowerCase().trim() === (userAnswer || "").toLowerCase().trim()
                )
            }

            return {
                questionIndex: index,
                questionText: q.question,
                questionType: q.type,
                // Options are plain strings for multiple choice
                options: q.options || null,
                userAnswer,
                correctAnswer,
                isCorrect,
                points: q.points || 1,
            }
        })

        return NextResponse.json({
            quizName: quiz.name,
            student: {
                id: currentAttempt.memberId,
                name: currentAttempt.member.user.name,
                email: currentAttempt.member.user.email,
            },
            score: currentAttempt.score || 0,
            totalQuestions: currentAttempt.totalQuestions,
            percentage: currentAttempt.percentage || 0,
            submittedAt: currentAttempt.submittedAt,
            autoSubmitted: currentAttempt.autoSubmitted,
            details: detailedResults,
            allAttempts: attemptsSummary,
            currentAttemptId: currentAttempt.id
        })
    } catch (error) {
        console.error("Get student result error:", error)
        return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 })
    }
}
