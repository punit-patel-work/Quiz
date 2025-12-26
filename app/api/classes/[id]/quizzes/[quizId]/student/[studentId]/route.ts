import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/classes/[id]/quizzes/[quizId]/student/[studentId] - Get student's detailed result (for teacher)
export async function GET(
    request: Request,
    { params }: { params: { id: string; quizId: string; studentId: string } }
) {
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

        // Get the student's attempt
        const attempt = await prisma.classQuizAttempt.findFirst({
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

        if (!attempt) {
            return NextResponse.json({ error: "No result found" }, { status: 404 })
        }

        // Build detailed breakdown
        const questions = quiz.questions as any[]
        const userAnswers = (attempt.userAnswers as any[]) || []

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
                isCorrect = userAnswer === q.correct_answer
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
                id: attempt.memberId,
                name: attempt.member.user.name,
                email: attempt.member.user.email,
            },
            score: attempt.score || 0,
            totalQuestions: attempt.totalQuestions,
            percentage: attempt.percentage || 0,
            submittedAt: attempt.submittedAt,
            autoSubmitted: attempt.autoSubmitted,
            details: detailedResults,
        })
    } catch (error) {
        console.error("Get student result error:", error)
        return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 })
    }
}
