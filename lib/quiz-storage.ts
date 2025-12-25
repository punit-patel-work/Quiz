import { Question } from "./quiz-validator"

/**
 * Optimize answer storage by storing only answer values, not full questions
 */
export function optimizeAnswers(
    userAnswers: Map<number, string | boolean | null>,
    questions: Question[]
): { questionId: number; answer: string | boolean | null }[] {
    return Array.from(userAnswers.entries()).map(([questionId, answer]) => ({
        questionId,
        answer,
    }))
}

/**
 * Reconstruct full results from quiz questions and optimized answers
 */
export function reconstructResults(
    questions: Question[],
    optimizedAnswers: { questionId: number; answer: string | boolean | null }[]
) {
    const answersMap = new Map(
        optimizedAnswers.map((item) => [item.questionId, item.answer])
    )

    return questions.map((question) => {
        const userAnswer = answersMap.get(question.id) ?? null
        let isCorrect = false

        if (question.type === "multiple_choice") {
            isCorrect = userAnswer === question.correct_answer
        } else if (question.type === "true_false") {
            isCorrect = userAnswer === question.correct_answer
        } else if (question.type === "fill_in_the_blank") {
            const rawAnswers = Array.isArray(question.correct_answer)
                ? question.correct_answer
                : [question.correct_answer]

            // Filter to only string answers and normalize
            const correctAnswers = rawAnswers
                .filter((ans): ans is string => typeof ans === "string")

            const normalizedUserAnswer = typeof userAnswer === "string"
                ? userAnswer.trim().toLowerCase()
                : ""

            isCorrect = correctAnswers.some(
                (ans) => ans.trim().toLowerCase() === normalizedUserAnswer
            )
        }

        return {
            questionId: question.id,
            userAnswer,
            correctAnswer: question.correct_answer,
            isCorrect,
            question: question.question,
            explanation: question.explanation,
            type: question.type,
            topic: question.topic,
            options: question.options,
        }
    })
}

/**
 * Validate quiz name
 */
export function validateQuizName(name: string): {
    valid: boolean
    error?: string
} {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: "Quiz name is required" }
    }

    if (name.length > 100) {
        return { valid: false, error: "Quiz name must be 100 characters or less" }
    }

    return { valid: true }
}

/**
 * Generate quiz description from questions
 */
export function generateQuizDescription(questions: Question[]): string {
    const topics = [...new Set(questions.map((q) => q.topic))].slice(0, 3)
    const topicsText = topics.join(", ")

    return `${questions.length} questions covering ${topicsText}${topics.length < questions.length ? ", and more" : ""
        }`
}
