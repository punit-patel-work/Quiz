"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ResultsDisplay } from "@/components/quiz/results-display"
import { Button } from "@/components/ui/button"
import { useQuizStore } from "@/lib/store"
import { RotateCcw, Home, Play } from "lucide-react"

export default function ResultsPage() {
  const [resultData, setResultData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setQuestions, setQuizId, setQuizName, setTimeLimit, resetQuiz } = useQuizStore()

  useEffect(() => {
    const resultId = searchParams.get("id")
    if (resultId) {
      fetchResult(resultId)
    } else {
      router.push("/dashboard")
    }
  }, [searchParams])

  const fetchResult = async (id: string) => {
    try {
      const res = await fetch(`/api/quiz-result/${id}`)
      if (res.ok) {
        const data = await res.json()
        setResultData(data)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch result:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestartQuiz = async () => {
    if (!resultData) return

    try {
      // Fetch the quiz data from the result
      const res = await fetch(`/api/quizzes/${resultData.quizId || resultData.id}`)
      
      if (res.ok) {
        const quiz = await res.json()
        
        // Reset store and load quiz
        resetQuiz()
        setQuizId(quiz.id)
        setQuizName(quiz.name || resultData.quizName)
        setQuestions(quiz.questions || resultData.quizData)
        setTimeLimit(resultData.timeLimit || 30)
        
        // Navigate to quiz page
        router.push("/quiz")
      } else {
        // Fallback: use data from result if quiz not found
        resetQuiz()
        setQuizName(resultData.quizName)
        setQuestions(resultData.quizData)
        setTimeLimit(resultData.timeLimit || 30)
        router.push("/quiz")
      }
    } catch (error) {
      console.error("Failed to restart quiz:", error)
    }
  }

  const handleTakeAnother = () => {
    resetQuiz()
    router.push("/setup")
  }

  const handleGoHome = () => {
    resetQuiz()
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!resultData) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={handleRestartQuiz} size="lg" variant="default">
            <RotateCcw className="mr-2 h-5 w-5" />
            Restart Quiz
          </Button>
          <Button onClick={handleTakeAnother} size="lg" variant="outline">
            <Play className="mr-2 h-5 w-5" />
            Take Another Quiz
          </Button>
          <Button onClick={handleGoHome} size="lg" variant="outline">
            <Home className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Button>
        </div>

        {/* Results Display */}
        <ResultsDisplay
          score={resultData.score}
          totalQuestions={resultData.totalQuestions}
          percentage={resultData.percentage}
          results={resultData.results}
          questions={resultData.quizData}
        />
      </div>
    </div>
  )
}
