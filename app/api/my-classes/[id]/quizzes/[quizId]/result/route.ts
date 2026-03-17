import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkAnswer } from "@/lib/scoring"

// GET /api/my-classes/[id]/quizzes/[quizId]/result - Get student's detailed result for a quiz
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string; quizId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check membership
        const member = await prisma.classMember.findUnique({
            where: {
                classId_userId: {
                    classId: params.id,
                    userId: session.user.id,
                },
            },
        })

        if (!member) {
            return NextResponse.json({ error: "Not a member" }, { status: 403 })
        }

        // Get quiz info with questions
        const quiz = await prisma.classQuiz.findUnique({
            where: { id: params.quizId },
            select: {
                id: true,
                name: true,
                showResults: true,
                questions: true,
            },
        })

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
        }

        // Get the latest submitted attempt
        const attempt = await prisma.classQuizAttempt.findFirst({
            where: {
                classQuizId: params.quizId,
                memberId: member.id,
                status: "submitted",
            },
            include: {
                descriptiveGrades: true,
            },
            orderBy: { submittedAt: "desc" },
        })

        if (!attempt) {
            return NextResponse.json({ error: "No result found" }, { status: 404 })
        }

        // If descriptive questions are pending grading, gate the results
        if (attempt.gradingStatus === "pending") {
            return NextResponse.json({
                quizName: quiz.name,
                score: null,
                totalQuestions: attempt.totalQuestions,
                percentage: null,
                submittedAt: attempt.submittedAt,
                autoSubmitted: attempt.autoSubmitted,
                showResults: false,
                gradingStatus: "pending",
                details: null,
                message: "Your quiz is being reviewed by your teacher. Results will be available once all descriptive answers have been graded.",
            })
        }

        // Build detailed breakdown if showResults is enabled
        let detailedResults = null
        if (quiz.showResults) {
            const questions = quiz.questions as any[]
            const userAnswers = (attempt.userAnswers as any[]) || []

            // Create a map for quick lookup - key is the question's id
            const answerMap = new Map<number, any>()
            userAnswers.forEach((a: any) => {
                answerMap.set(Number(a.questionId), a.answer)
            })

            detailedResults = questions.map((q, index) => {
                // Use q.id (the question's actual id) to lookup the answer
                const userAnswer = answerMap.get(q.id)
                const isDescriptive = q.type === 'descriptive'

                // Use share scoring logic
                const isCorrect = isDescriptive ? null : checkAnswer(q, userAnswer)

                let correctAnswer: any = null

                if (q.type === "multiple_choice" || q.type === "true_false") {
                    correctAnswer = q.correct_answer
                } else if (q.type === "fill_in_the_blank") {
                    const correctAnswers = Array.isArray(q.correct_answer)
                        ? q.correct_answer
                        : [q.correct_answer]
                    correctAnswer = correctAnswers[0]
                }

                // For descriptive questions, include grade info if graded
                let descriptiveGrade = null
                if (isDescriptive && attempt.gradingStatus === "graded") {
                    const grade = (attempt as any).descriptiveGrades?.find(
                        (g: any) => g.questionId === q.id
                    )
                    if (grade) {
                        descriptiveGrade = {
                            score: grade.score,
                            maxScore: grade.maxScore,
                            feedback: grade.feedback,
                        }
                    }
                }

                return {
                    questionIndex: index,
                    questionText: q.question,
                    questionType: q.type,
                    options: q.options || null,
                    userAnswer,
                    correctAnswer,
                    explanation: q.explanation || null,
                    isCorrect,
                    isDescriptive,
                    descriptiveGrade,
                    points: q.points || 1,
                }
            })
        }

        return NextResponse.json({
            quizName: quiz.name,
            score: attempt.score || 0,
            totalQuestions: attempt.totalQuestions,
            percentage: attempt.percentage || 0,
            submittedAt: attempt.submittedAt,
            autoSubmitted: attempt.autoSubmitted,
            showResults: quiz.showResults,
            gradingStatus: attempt.gradingStatus,
            details: detailedResults,
        })
    } catch (error) {
        console.error("Get result error:", error)
        return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 })
    }
}
