import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

// GET /api/classes/[id]/quizzes/[quizId]/grade - Get all attempts with descriptive answers for grading
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

        // Verify teacher
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the teacher can grade quizzes" },
                { status: 403 }
            )
        }

        // Get quiz with questions
        const quiz = await prisma.classQuiz.findUnique({
            where: { id: params.quizId },
        })

        if (!quiz || quiz.classId !== params.id) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
        }

        const questions = quiz.questions as any[]
        const descriptiveQuestions = questions.filter((q: any) => q.type === "descriptive")

        if (descriptiveQuestions.length === 0) {
            return NextResponse.json({
                quiz: { id: quiz.id, name: quiz.name },
                descriptiveQuestions: [],
                attempts: [],
                summary: { total: 0, graded: 0, pending: 0 },
            })
        }

        // Get all submitted attempts with their descriptive grades
        const attempts = await prisma.classQuizAttempt.findMany({
            where: {
                classQuizId: params.quizId,
                status: "submitted",
            },
            include: {
                member: {
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                },
                descriptiveGrades: true,
            },
            orderBy: { submittedAt: "desc" },
        })

        const attemptData = attempts.map((attempt) => {
            const userAnswers = (attempt.userAnswers as any[]) || []
            const answerMap = new Map<number, any>()
            userAnswers.forEach((a: any) => {
                answerMap.set(Number(a.questionId), a.answer)
            })

            // Get descriptive answers for this attempt
            const descriptiveAnswers = descriptiveQuestions.map((q: any) => {
                const existingGrade = attempt.descriptiveGrades.find(
                    (g) => g.questionId === q.id
                )

                return {
                    questionId: q.id,
                    questionText: q.question,
                    maxScore: q.max_score || 1,
                    modelAnswer: q.model_answer || null,
                    studentAnswer: answerMap.get(q.id) || null,
                    grade: existingGrade
                        ? {
                            score: existingGrade.score,
                            maxScore: existingGrade.maxScore,
                            feedback: existingGrade.feedback,
                        }
                        : null,
                }
            })

            const gradedCount = descriptiveAnswers.filter((a) => a.grade !== null).length
            const allGraded = gradedCount === descriptiveQuestions.length

            return {
                attemptId: attempt.id,
                studentName: attempt.member.user.name,
                studentEmail: attempt.member.user.email,
                submittedAt: attempt.submittedAt,
                gradingStatus: attempt.gradingStatus,
                autoGradedScore: attempt.score,
                totalQuestions: attempt.totalQuestions,
                descriptiveAnswers,
                gradedCount,
                totalDescriptive: descriptiveQuestions.length,
                allGraded,
            }
        })

        const gradedAttempts = attemptData.filter((a) => a.allGraded).length
        const pendingAttempts = attemptData.length - gradedAttempts

        return NextResponse.json({
            quiz: { id: quiz.id, name: quiz.name },
            descriptiveQuestions: descriptiveQuestions.map((q: any) => ({
                id: q.id,
                question: q.question,
                maxScore: q.max_score || 1,
                modelAnswer: q.model_answer || null,
            })),
            attempts: attemptData,
            summary: {
                total: attemptData.length,
                graded: gradedAttempts,
                pending: pendingAttempts,
            },
        })
    } catch (error) {
        console.error("Grade fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch grading data" }, { status: 500 })
    }
}

// POST /api/classes/[id]/quizzes/[quizId]/grade - Submit grades for an attempt
export async function POST(
    request: Request,
    props: { params: Promise<{ id: string; quizId: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify teacher
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData || classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the teacher can grade quizzes" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { attemptId, grades } = body

        if (!attemptId || !grades || !Array.isArray(grades)) {
            return NextResponse.json(
                { error: "attemptId and grades array are required" },
                { status: 400 }
            )
        }

        // Get the attempt
        const attempt = await prisma.classQuizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                classQuiz: true,
                member: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
            },
        })

        if (!attempt || attempt.classQuiz.classId !== params.id || attempt.classQuiz.id !== params.quizId) {
            return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
        }

        // Upsert each grade
        for (const grade of grades) {
            await prisma.descriptiveGrade.upsert({
                where: {
                    attemptId_questionId: {
                        attemptId,
                        questionId: grade.questionId,
                    },
                },
                create: {
                    attemptId,
                    questionId: grade.questionId,
                    score: grade.score,
                    maxScore: grade.maxScore || 1,
                    feedback: grade.feedback || null,
                    gradedById: session.user.id,
                },
                update: {
                    score: grade.score,
                    maxScore: grade.maxScore || 1,
                    feedback: grade.feedback || null,
                    gradedById: session.user.id,
                    gradedAt: new Date(),
                },
            })
        }

        // Check if all descriptive questions for this attempt are now graded
        const questions = attempt.classQuiz.questions as any[]
        const descriptiveQuestions = questions.filter((q: any) => q.type === "descriptive")
        const gradedCount = await prisma.descriptiveGrade.count({
            where: { attemptId },
        })

        const allGraded = gradedCount >= descriptiveQuestions.length

        if (allGraded) {
            // Recalculate total score: auto-graded + descriptive grades
            const allDescriptiveGrades = await prisma.descriptiveGrade.findMany({
                where: { attemptId },
            })

            const descriptiveScore = allDescriptiveGrades.reduce((sum, g) => sum + g.score, 0)
            const descriptiveMaxScore = allDescriptiveGrades.reduce((sum, g) => sum + g.maxScore, 0)

            // Auto-graded score is already stored in the attempt
            const autoGradedScore = attempt.score || 0
            const autoGradableCount = questions.length - descriptiveQuestions.length

            // Total score = auto-graded (1 pt each) + descriptive score
            const totalScore = autoGradedScore + descriptiveScore
            const totalMaxScore = autoGradableCount + descriptiveMaxScore
            const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0

            await prisma.classQuizAttempt.update({
                where: { id: attemptId },
                data: {
                    score: totalScore,
                    percentage: Math.round(percentage * 100) / 100,
                    gradingStatus: "graded",
                },
            })

            // Notify the student
            try {
                await createNotification({
                    userId: attempt.member.user.id,
                    title: "Quiz Graded",
                    message: `Your descriptive answers for "${attempt.classQuiz.name}" have been reviewed. Your results are now available.`,
                    type: "SUCCESS",
                    link: `/my-classes/${params.id}/quiz/${params.quizId}/result`,
                })
            } catch (e) {
                console.error("Failed to send grading notification:", e)
            }
        }

        return NextResponse.json({
            message: allGraded
                ? "All descriptive questions graded. Student has been notified."
                : `${gradedCount}/${descriptiveQuestions.length} questions graded.`,
            allGraded,
            gradedCount,
            totalDescriptive: descriptiveQuestions.length,
        })
    } catch (error) {
        console.error("Grading error:", error)
        return NextResponse.json({ error: "Failed to save grades" }, { status: 500 })
    }
}
