"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/lib/store"
import { QuestionRenderer } from "@/components/quiz/question-renderer"
import { Timer } from "@/components/quiz/timer"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function QuizPage() {
  const router = useRouter()
  const { toast } = useToast()
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
  } = useQuizStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)

    try {
      const timeTaken = getTimeTaken()
      
      // Convert Map to array format for API
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
  }

  const handleAnswerChange = (answer: string | boolean) => {
    setAnswer(currentQuestion.id, answer)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = userAnswers.get(currentQuestion?.id)
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = userAnswers.size

  if (questions.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quizName || "Quiz"}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <Timer />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{answeredCount} answered</span>
            <span>{questions.length - answeredCount} remaining</span>
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
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={nextQuestion}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
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
              {questions.map((_: any, index: number) => {
                const isAnswered = Array.from(userAnswers.keys()).includes(
                  questions[index].id
                )
                const isCurrent = index === currentQuestionIndex

                return (
                  <button
                    key={index}
                    onClick={() => useQuizStore.getState().goToQuestion(index)}
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
