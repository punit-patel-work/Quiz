import { create } from "zustand"
import { Question } from "./quiz-validator"

interface QuizStore {
    // Quiz metadata
    quizId: string | null
    quizName: string | null

    // Quiz data
    questions: Question[]
    currentQuestionIndex: number
    userAnswers: Map<number, string | boolean | null>

    // Timer
    timeLimit: number // in minutes
    timeRemaining: number // in seconds
    startTime: number | null // timestamp when quiz started
    isQuizActive: boolean
    isQuizCompleted: boolean

    // Actions
    setQuizId: (id: string) => void
    setQuizName: (name: string) => void
    setQuestions: (questions: Question[]) => void
    setTimeLimit: (minutes: number) => void
    setAnswer: (questionId: number, answer: string | boolean) => void
    nextQuestion: () => void
    previousQuestion: () => void
    goToQuestion: (index: number) => void
    startQuiz: () => void
    submitQuiz: () => void
    decrementTime: () => void
    resetQuiz: () => void
    getTimeTaken: () => number // returns seconds elapsed
}

export const useQuizStore = create<QuizStore>((set, get) => ({
    // Initial state
    quizId: null,
    quizName: null,
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: new Map(),
    timeLimit: 30,
    timeRemaining: 0,
    startTime: null,
    isQuizActive: false,
    isQuizCompleted: false,

    // Actions
    setQuizId: (id: string) => set({ quizId: id }),

    setQuizName: (name: string) => set({ quizName: name }),

    setQuestions: (questions: Question[]) => set({ questions }),

    setTimeLimit: (minutes: number) =>
        set({ timeLimit: minutes, timeRemaining: minutes * 60 }),

    setAnswer: (questionId: number, answer: string | boolean) =>
        set((state) => {
            const newAnswers = new Map(state.userAnswers)
            newAnswers.set(questionId, answer)
            return { userAnswers: newAnswers }
        }),

    nextQuestion: () =>
        set((state) => {
            if (state.currentQuestionIndex < state.questions.length - 1) {
                return { currentQuestionIndex: state.currentQuestionIndex + 1 }
            }
            return state
        }),

    previousQuestion: () =>
        set((state) => {
            if (state.currentQuestionIndex > 0) {
                return { currentQuestionIndex: state.currentQuestionIndex - 1 }
            }
            return state
        }),

    goToQuestion: (index: number) =>
        set((state) => {
            if (index >= 0 && index < state.questions.length) {
                return { currentQuestionIndex: index }
            }
            return state
        }),

    startQuiz: () =>
        set((state) => ({
            isQuizActive: true,
            startTime: Date.now(),
            timeRemaining: state.timeLimit * 60,
        })),

    submitQuiz: () =>
        set({
            isQuizActive: false,
            isQuizCompleted: true,
        }),

    decrementTime: () =>
        set((state) => {
            if (state.timeRemaining > 0) {
                return { timeRemaining: state.timeRemaining - 1 }
            }
            return state
        }),

    resetQuiz: () =>
        set({
            quizId: null,
            quizName: null,
            questions: [],
            currentQuestionIndex: 0,
            userAnswers: new Map(),
            timeLimit: 30,
            timeRemaining: 0,
            startTime: null,
            isQuizActive: false,
            isQuizCompleted: false,
        }),

    getTimeTaken: () => {
        const state = get()
        if (!state.startTime) return 0
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
        return elapsed
    },
}))
