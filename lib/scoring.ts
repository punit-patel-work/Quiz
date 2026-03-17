import { Question } from './quiz-validator'

export interface UserAnswer {
    questionId: number
    userAnswer: string | boolean | null
    isCorrect: boolean
    isDescriptive?: boolean
}

/**
 * Check if an answer is correct (returns false for descriptive questions — they need manual grading)
 */
export function checkAnswer(question: Question, userAnswer: string | boolean | null): boolean {
    // Descriptive questions cannot be auto-graded
    if (question.type === 'descriptive') {
        return false
    }

    if (userAnswer === null || userAnswer === undefined) {
        return false
    }

    const correctAnswer = question.correct_answer

    // Handle true/false questions
    if (question.type === 'true_false') {
        return String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase()
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
 * Calculate quiz score (auto-gradable questions only; descriptive questions are scored separately by teacher)
 */
export function calculateScore(
    questions: Question[],
    userAnswers: Map<number, string | boolean | null>
): {
    score: number
    totalQuestions: number
    percentage: number
    results: UserAnswer[]
    autoGradedScore: number
    autoGradableCount: number
    descriptiveCount: number
    hasDescriptive: boolean
} {
    const results: UserAnswer[] = []
    let autoGradedScore = 0
    let descriptiveCount = 0

    questions.forEach((question) => {
        const userAnswer = userAnswers.get(question.id) ?? null
        const isDescriptive = question.type === 'descriptive'

        if (isDescriptive) {
            descriptiveCount++
            results.push({
                questionId: question.id,
                userAnswer,
                isCorrect: false,
                isDescriptive: true,
            })
        } else {
            const isCorrect = checkAnswer(question, userAnswer)
            if (isCorrect) {
                autoGradedScore++
            }
            results.push({
                questionId: question.id,
                userAnswer,
                isCorrect,
                isDescriptive: false,
            })
        }
    })

    const totalQuestions = questions.length
    const autoGradableCount = totalQuestions - descriptiveCount
    // Percentage is based on auto-gradable questions only (will be recalculated after teacher grading)
    const percentage = autoGradableCount > 0 ? (autoGradedScore / autoGradableCount) * 100 : 0

    return {
        score: autoGradedScore, // Only auto-graded score for now
        totalQuestions,
        percentage: Math.round(percentage * 100) / 100,
        results,
        autoGradedScore,
        autoGradableCount,
        descriptiveCount,
        hasDescriptive: descriptiveCount > 0,
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
