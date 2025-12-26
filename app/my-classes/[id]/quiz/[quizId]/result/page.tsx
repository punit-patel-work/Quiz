"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, ArrowLeft, Home, Loader2, CheckCircle, XCircle, Circle } from "lucide-react"

interface DetailedQuestion {
  questionIndex: number
  questionText: string
  questionType: string
  options: string[] | null
  userAnswer: string | boolean | null
  correctAnswer: string | boolean
  isCorrect: boolean
  points: number
}

export default function ClassQuizResultPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()

  const classId = params.id as string
  const quizId = params.quizId as string

  useEffect(() => {
    fetchResult()
  }, [classId, quizId])

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/my-classes/${classId}/quizzes/${quizId}/result`)
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        router.push(`/my-classes/${classId}`)
      }
    } catch (error) {
      console.error("Failed to fetch result:", error)
      router.push(`/my-classes/${classId}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: "A", color: "text-green-600" }
    if (pct >= 80) return { grade: "B", color: "text-blue-600" }
    if (pct >= 70) return { grade: "C", color: "text-yellow-600" }
    if (pct >= 60) return { grade: "D", color: "text-orange-600" }
    return { grade: "F", color: "text-red-600" }
  }

  const formatAnswer = (q: DetailedQuestion, answerValue: string | boolean | null) => {
    if (answerValue === null || answerValue === undefined) {
      return <span className="text-muted-foreground italic">Not answered</span>
    }
    
    if (q.questionType === "true_false") {
      return answerValue ? "True" : "False"
    }
    
    // For multiple choice and fill_in_the_blank, answer is already the text
    return String(answerValue)
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

  if (!result) return null

  const { grade, color } = getGrade(result.percentage || 0)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Summary Card */}
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            <CardDescription>{result.quizName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div>
                <div className="text-5xl font-bold text-primary">
                  {result.score}/{result.totalQuestions}
                </div>
                <div className="text-lg font-medium mt-1">
                  {(result.percentage || 0).toFixed(0)}% - Grade: <span className={color}>{grade}</span>
                </div>
              </div>
            </div>
            <Progress value={result.percentage || 0} className="h-2" />
            
            <div className="flex justify-center gap-8 pt-2">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{result.score}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{result.totalQuestions - result.score}</div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
            </div>

            {result.submittedAt && (
              <div className="text-sm text-muted-foreground">
                Submitted: {new Date(result.submittedAt).toLocaleString()}
                {result.autoSubmitted && " (auto-submitted)"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        {result.showResults && result.details && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Breakdown</CardTitle>
              <CardDescription>Review your answers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.details.map((q: DetailedQuestion) => (
                <div
                  key={q.questionIndex}
                  className={`p-4 rounded-lg border ${
                    q.isCorrect 
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
                      : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {q.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-2">
                        Q{q.questionIndex + 1}. {q.questionText}
                      </div>
                      
                      {/* Show options for multiple choice */}
                      {q.questionType === "multiple_choice" && q.options && (
                        <div className="space-y-1 mb-3">
                          {q.options.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`text-sm px-3 py-1.5 rounded flex items-center gap-2 ${
                                opt === q.correctAnswer
                                  ? "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200"
                                  : opt === q.userAnswer && !q.isCorrect
                                    ? "bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200"
                                    : "bg-muted/50"
                              }`}
                            >
                              <Circle className={`h-3 w-3 ${
                                opt === q.userAnswer ? "fill-current" : ""
                              }`} />
                              <span>{opt}</span>
                              {opt === q.correctAnswer && (
                                <CheckCircle className="h-3 w-3 ml-auto text-green-600" />
                              )}
                              {opt === q.userAnswer && !q.isCorrect && (
                                <XCircle className="h-3 w-3 ml-auto text-red-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Show for true/false */}
                      {q.questionType === "true_false" && (
                        <div className="flex gap-2 mb-3">
                          {[true, false].map((val) => (
                            <div
                              key={String(val)}
                              className={`text-sm px-3 py-1.5 rounded flex items-center gap-2 ${
                                val === q.correctAnswer
                                  ? "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200"
                                  : val === q.userAnswer && !q.isCorrect
                                    ? "bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200"
                                    : "bg-muted/50"
                              }`}
                            >
                              <Circle className={`h-3 w-3 ${
                                val === q.userAnswer ? "fill-current" : ""
                              }`} />
                              <span>{val ? "True" : "False"}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Summary */}
                      <div className="text-xs text-muted-foreground">
                        Your answer: <strong>{formatAnswer(q, q.userAnswer)}</strong>
                        {!q.isCorrect && (
                          <> • Correct: <strong className="text-green-600">{formatAnswer(q, q.correctAnswer)}</strong></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!result.showResults && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Detailed results are not available for this quiz.
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/my-classes/${classId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Class
            </Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href="/my-classes">
              <Home className="mr-2 h-4 w-4" />
              My Classes
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
