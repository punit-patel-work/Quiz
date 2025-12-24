import { Question } from './quiz-validator'

export interface UserAnswer {
    questionId: number
    userAnswer: string | boolean | null
    isCorrect: boolean
}

/**
 * Check if an answer is correct
 */
export function checkAnswer(question: Question, userAnswer: string | boolean | null): boolean {
    if (userAnswer === null || userAnswer === undefined) {
        return false
    }

    const correctAnswer = question.correct_answer

    // Handle true/false questions
    if (question.type === 'true_false') {
        return userAnswer === correctAnswer
    }

    // Handle multiple choice
    if (question.type === 'multiple_choice') {
        return userAnswer === correctAnswer
    }

    // Handle fill in the blank
    if (question.type === 'fill_in_the_blank' && Array.isArray(correctAnswer)) {
        const normalizedUserAnswer = String(userAnswer).trim().toLowerCase()
        return correctAnswer.some(
            (answer) => answer.trim().toLowerCase() === normalizedUserAnswer
        )
    }

    return false
}

/**
 * Calculate quiz score
 */
export function calculateScore(
    questions: Question[],
    userAnswers: Map<number, string | boolean | null>
): {
    score: number
    totalQuestions: number
    percentage: number
    results: UserAnswer[]
} {
    const results: UserAnswer[] = []
    let score = 0

    questions.forEach((question) => {
        const userAnswer = userAnswers.get(question.id) ?? null
        const isCorrect = checkAnswer(question, userAnswer)

        if (isCorrect) {
            score++
        }

        results.push({
            questionId: question.id,
            userAnswer,
            isCorrect,
        })
    })

    const totalQuestions = questions.length
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0

    return {
        score,
        totalQuestions,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        results,
    }
}

/**
 * Get grade based on percentage
 */
export function getGrade(percentage: number): string {
    if (percentage >= 90) return 'A+'
    if (percentage >= 85) return 'A'
    if (percentage >= 80) return 'A-'
    if (percentage >= 75) return 'B+'
    if (percentage >= 70) return 'B'
    if (percentage >= 65) return 'B-'
    if (percentage >= 60) return 'C+'
    if (percentage >= 55) return 'C'
    if (percentage >= 50) return 'C-'
    return 'F'
}
