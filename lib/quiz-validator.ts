import { z } from 'zod'

export const QuestionSchema = z.object({
    id: z.number(),
    type: z.enum(['multiple_choice', 'fill_in_the_blank', 'true_false']),
    topic: z.string(),
    question: z.string(),
    options: z.array(z.string()).optional(),
    correct_answer: z.union([z.string(), z.boolean(), z.array(z.string())]),
    explanation: z.string(),
})

export const QuizSchema = z.array(QuestionSchema)

export type Question = z.infer<typeof QuestionSchema>
export type Quiz = z.infer<typeof QuizSchema>

/**
 * Validate quiz JSON structure
 */
export function validateQuizJSON(data: unknown) {
    try {
        const quiz = QuizSchema.parse(data)
        return { success: true, data: quiz }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors }
        }
        return { success: false, error: 'Invalid JSON format' }
    }
}
