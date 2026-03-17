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
import { checkAnswer } from "./scoring"

// ...

export function reconstructResults(
    questions: Question[],
    optimizedAnswers: { questionId: number; answer: string | boolean | null }[]
) {
    const answersMap = new Map(
        optimizedAnswers.map((item) => [item.questionId, item.answer])
    )

    return questions.map((question) => {
        const userAnswer = answersMap.get(question.id) ?? null
        const isDescriptive = question.type === 'descriptive'
        const isCorrect = isDescriptive ? false : checkAnswer(question, userAnswer)

        return {
            questionId: question.id,
            userAnswer,
            correctAnswer: question.correct_answer,
            isCorrect,
            isDescriptive,
            question: question.question,
            explanation: question.explanation,
            type: question.type,
            topic: question.topic,
            options: question.options,
            maxScore: question.max_score,
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
