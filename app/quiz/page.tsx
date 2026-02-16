"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/lib/store"
import { QuestionRenderer } from "@/components/quiz/question-renderer"
import { Timer } from "@/components/quiz/timer"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Send, Maximize2, Minimize2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function QuizPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zenMode, setZenMode] = useState(false)

  const {
    quizId,
    quizName,
    questions,
    currentQuestionIndex,
    userAnswers,
    timeRemaining,
    isQuizActive,
    startQuiz: startQuizStore,
    decrementTime,
    nextQuestion,
    previousQuestion,
    getTimeTaken,
    setAnswer,
    goToQuestion,
  } = useQuizStore()

  // Initialize quiz
  useEffect(() => {
    if (questions.length === 0) {
      router.push("/setup")
      return
    }

    if (!isQuizActive) {
      startQuizStore()
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (!isQuizActive || timeRemaining <= 0) return

    const interval = setInterval(() => {
      decrementTime()
    }, 1000)

    return () => clearInterval(interval)
  }, [isQuizActive, timeRemaining, decrementTime])

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && isQuizActive) {
      handleSubmit()
    }
  }, [timeRemaining])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentQuestionIndex < questions.length - 1) {
        nextQuestion()
      } else if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        previousQuestion()
      } else if (e.key === "Enter" && e.metaKey) { // Cmd+Enter to submit
        handleSubmit()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentQuestionIndex, questions.length])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const timeTaken = getTimeTaken()
      
      const answersArray = Array.from(userAnswers.entries()).map(
        ([questionId, userAnswer]) => ({
          questionId,
          userAnswer,
        })
      )

      const res = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          userAnswers: answersArray,
          timeLimit: Math.floor(timeRemaining / 60),
          timeTaken,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/results?id=${data.id}`)
      } else {
        throw new Error("Submission failed")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your quiz. Please try again.",
      })
      setIsSubmitting(false)
    }
  }, [isSubmitting, getTimeTaken, userAnswers, quizId, timeRemaining, router, toast])

  const handleAnswerChange = (answer: string | boolean) => {
    const question = questions[currentQuestionIndex]
    if (question) {
      setAnswer(question.id, answer)
      
      // Auto-advance after small delay (optional "flow" feature)
      // setTimeout(() => {
      //   if (currentQuestionIndex < questions.length - 1) nextQuestion()
      // }, 800)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = userAnswers.get(currentQuestion?.id)
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = userAnswers.size

  if (questions.length === 0) return null

  return (
    <div className={`min-h-screen transition-colors duration-500 ${zenMode ? 'bg-background' : 'bg-muted/30'}`}>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg truncate max-w-[200px] sm:max-w-md">
              {quizName || "Quiz Session"}
            </h1>
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Timer />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setZenMode(!zenMode)
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(e => console.error(e))
                } else {
                  if (document.exitFullscreen) {
                    document.exitFullscreen()
                  }
                }
              }}
              title="Toggle Zen Mode"
            >
              {zenMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Progress Line */}
        <motion.div 
          className="h-1 bg-primary origin-left" 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-24 md:py-32 max-w-3xl">
        <div className="space-y-12">
          {currentQuestion && (
            <QuestionRenderer 
              question={currentQuestion}
              answer={currentAnswer ?? null}
              onAnswerChange={handleAnswerChange}
            />
          )}

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t">
            <Button
              variant="ghost"
              size="lg"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            <div className="flex gap-2">
                {/* Dots Indicator */}
                <div className="hidden md:flex gap-1.5 items-center">
                    {questions.map((_, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => goToQuestion(i)}
                            className={`h-2 w-2 rounded-full transition-colors ${
                                i === currentQuestionIndex ? "bg-primary" : 
                                userAnswers.has(questions[i].id) ? "bg-primary/30" : "bg-muted"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button 
                size="lg" 
                onClick={nextQuestion}
                className="w-full sm:w-auto px-8"
              >
                Next Question
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black"
              >
                {isSubmitting ? "Submitting..." : "Complete Quiz"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Keyboard Shortcuts Hint */}
      {!zenMode && (
        <div className="fixed bottom-4 right-4 text-xs text-muted-foreground hidden lg:block opacity-50 hover:opacity-100 transition-opacity">
          Press <kbd className="px-1 py-0.5 rounded border bg-muted">←</kbd> <kbd className="px-1 py-0.5 rounded border bg-muted">→</kbd> to navigate
        </div>
      )}
    </div>
  )
}
