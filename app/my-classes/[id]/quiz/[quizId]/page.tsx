"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { QuestionRenderer } from "@/components/quiz/question-renderer"
import { useToast } from "@/components/ui/use-toast"
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Clock, 
  AlertTriangle,
  Loader2 
} from "lucide-react"

export default function ClassQuizPage() {
  const [quizData, setQuizData] = useState<any>(null)
  const [attemptData, setAttemptData] = useState<any>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<number, string | boolean | null>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const startedRef = useRef(false)

  const classId = params.id as string
  const quizId = params.quizId as string

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (startedRef.current) return
    startedRef.current = true
    startQuiz()
  }, [classId, quizId])

  const startQuiz = async () => {
    const url = `/api/my-classes/${classId}/quizzes/${quizId}/start`
    console.log("Starting quiz - URL:", url)
    
    try {
      const res = await fetch(url, {
        method: "POST",
      })

      console.log("Start quiz response status:", res.status)

      const data = await res.json()
      console.log("Start quiz response data:", data)

      if (res.ok) {
        setQuizData(data.quiz)
        setAttemptData(data.attempt)
        setTimeRemaining(data.remainingSeconds)

        if (data.resuming) {
          toast({
            title: "Resuming Quiz",
            description: "You're continuing your previous attempt.",
          })
        }
      } else {
        toast({
          variant: "destructive",
          title: "Cannot Start Quiz",
          description: data.error || "Unknown error occurred",
        })
        router.push(`/my-classes/${classId}`)
      }
    } catch (error) {
      console.error("Start quiz error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start quiz - network error",
      })
      router.push(`/my-classes/${classId}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Timer countdown
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
        ([questionId, userAnswer]) => ({
          questionId,
          userAnswer,
        })
      )

      const res = await fetch(`/api/my-classes/${classId}/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswers: answersArray,
          autoSubmit,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: autoSubmit ? "Time's Up!" : "Quiz Submitted",
          description: autoSubmit 
            ? "Your quiz was automatically submitted."
            : "Your answers have been recorded.",
        })

        if (data.result.showResults) {
          router.push(`/my-classes/${classId}/quiz/${quizId}/result?score=${data.result.score}&total=${data.result.totalQuestions}&percentage=${data.result.percentage}`)
        } else {
          router.push(`/my-classes/${classId}`)
        }
      } else {
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: data.error || "Failed to submit quiz. Please try again.",
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network error. Please check your connection and try again.",
      })
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!quizData) return null

  const currentQuestion = quizData.questions[currentQuestionIndex]
  const currentAnswer = userAnswers.get(currentQuestion?.id)
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100
  const answeredCount = userAnswers.size
  const isLowTime = timeRemaining < 60

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quizData.name}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quizData.questions.length}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl ${
            isLowTime 
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 animate-pulse" 
              : "bg-muted"
          }`}>
            <Clock className="h-5 w-5" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Low time warning */}
        {isLowTime && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Less than 1 minute remaining!</span>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{answeredCount} answered</span>
            <span>{quizData.questions.length - answeredCount} remaining</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Question */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionRenderer
                question={currentQuestion}
                answer={currentAnswer ?? null}
                onAnswerChange={handleAnswerChange}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestionIndex < quizData.questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex((i) => i + 1)}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {quizData.questions.map((_: any, index: number) => {
                const isAnswered = userAnswers.has(quizData.questions[index].id)
                const isCurrent = index === currentQuestionIndex

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`
                      aspect-square rounded-md text-sm font-medium transition-colors
                      ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isAnswered
                          ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                          : "bg-muted hover:bg-muted/80"
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
