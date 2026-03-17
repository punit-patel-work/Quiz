"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { QuestionRenderer } from "@/components/quiz/question-renderer"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Clock, 
  AlertTriangle,
  Loader2,
  Maximize2,
  Minimize2
} from "lucide-react"

export default function ClassQuizPage() {
  const [quizData, setQuizData] = useState<any>(null)
  const [attemptData, setAttemptData] = useState<any>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<number, string | boolean | null>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const startedRef = useRef(false)
  const classId = params.id as string
  const quizId = params.quizId as string

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    startQuiz()
  }, [classId, quizId])

  const startQuiz = async () => {
    const url = `/api/my-classes/${classId}/quizzes/${quizId}/start`
    try {
      const res = await fetch(url, { method: "POST" })
      const data = await res.json()

      if (res.ok) {
        setQuizData(data.quiz)
        setAttemptData(data.attempt)
        setTimeRemaining(data.remainingSeconds)
        if (data.resuming) {
          toast({ title: "Resuming Quiz", description: "Continuing previous attempt." })
        }
      } else {
        toast({ variant: "destructive", title: "Cannot Start Quiz", description: data.error })
        router.push(`/my-classes/${classId}`)
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to start quiz" })
      router.push(`/my-classes/${classId}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeRemaining])

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!quizData) return
      if (e.key === "ArrowRight" && currentQuestionIndex < quizData.questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1)
      } else if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(i => i - 1)
      } else if (e.key === "Enter" && e.metaKey) {
        handleSubmit(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentQuestionIndex, quizData])

  const handleAnswerChange = (answer: string | boolean) => {
    const question = quizData?.questions[currentQuestionIndex]
    if (question) {
      setUserAnswers((prev) => new Map(prev).set(question.id, answer))
    }
  }

  const handleSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const answersArray = Array.from(userAnswers.entries()).map(
        ([questionId, userAnswer]) => ({ questionId, userAnswer })
      )

      const res = await fetch(`/api/my-classes/${classId}/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAnswers: answersArray, autoSubmit }),
      })

      const data = await res.json()
      if (res.ok) {
        if (data.result.hasDescriptive) {
          toast({ 
            title: autoSubmit ? "Time's Up!" : "Quiz Submitted", 
            description: "Your answers have been recorded. Results will be available after your teacher reviews the descriptive answers." 
          })
          router.push(`/my-classes/${classId}`)
        } else {
          toast({ 
            title: autoSubmit ? "Time's Up!" : "Quiz Submitted", 
            description: "Your answers have been recorded." 
          })
          if (data.result.showResults) {
            router.push(`/my-classes/${classId}/quiz/${quizId}/result?score=${data.result.score}&total=${data.result.totalQuestions}&percentage=${data.result.percentage}`)
          } else {
            router.push(`/my-classes/${classId}`)
          }
        }
      } else {
        toast({ variant: "destructive", title: "Submission Error", description: data.error })
        setIsSubmitting(false)
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Network error" })
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleZenMode = () => {
    setZenMode(!zenMode)
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e))
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!quizData) return null

  const currentQuestion = quizData.questions[currentQuestionIndex]
  const currentAnswer = userAnswers.get(currentQuestion?.id)
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100
  const isLowTime = timeRemaining < 60

  return (
    <div className={`min-h-screen transition-colors duration-500 ${zenMode ? 'bg-background fixed inset-0 z-50 overflow-y-auto' : 'bg-muted/30'}`}>
       {/* Top Bar */}
       <header className={`sticky top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b ${zenMode ? 'px-8' : ''}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg truncate max-w-[200px] sm:max-w-md">
              {quizData.name}
            </h1>
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {currentQuestionIndex + 1} / {quizData.questions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono font-medium ${
              isLowTime ? "bg-red-100 text-red-600 animate-pulse" : "bg-muted"
            }`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
            
            <Button variant="ghost" size="icon" onClick={toggleZenMode} title="Toggle Zen Mode">
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
      <main className={`container mx-auto px-4 py-12 md:py-20 max-w-3xl ${zenMode ? 'max-w-4xl' : ''}`}>
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
              onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
              disabled={currentQuestionIndex === 0}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            <div className="hidden md:flex gap-1.5 items-center">
                {quizData.questions.map((_: any, i: number) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setCurrentQuestionIndex(i)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                            i === currentQuestionIndex ? "bg-primary" : 
                            userAnswers.has(quizData.questions[i].id) ? "bg-primary/30" : "bg-muted"
                        }`}
                    />
                ))}
            </div>

            {currentQuestionIndex < quizData.questions.length - 1 ? (
              <Button 
                size="lg" 
                onClick={() => setCurrentQuestionIndex(i => i + 1)}
                className="w-full sm:w-auto px-8"
              >
                Next Question
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
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
