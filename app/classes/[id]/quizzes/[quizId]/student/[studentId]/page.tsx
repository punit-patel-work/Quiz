"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Loader2, CheckCircle, XCircle, Circle, User } from "lucide-react"

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

export default function TeacherStudentResultPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()

  const classId = params.id as string
  const quizId = params.quizId as string
  const studentId = params.studentId as string

  useEffect(() => {
    fetchResult()
  }, [classId, quizId, studentId])

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/quizzes/${quizId}/student/${studentId}`)
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        router.push(`/classes/${classId}/quizzes/${quizId}/results`)
      }
    } catch (error) {
      console.error("Failed to fetch result:", error)
      router.push(`/classes/${classId}/quizzes/${quizId}/results`)
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/classes/${classId}/quizzes/${quizId}/results`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Student Result Details</h1>
            <p className="text-muted-foreground">{result.quizName}</p>
          </div>
        </div>

        {/* Student Info & Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium text-lg">{result.student.name || "Student"}</div>
                  <div className="text-sm text-muted-foreground">{result.student.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {result.score}/{result.totalQuestions}
                </div>
                <div className="text-lg">
                  {(result.percentage || 0).toFixed(0)}% - <span className={color}>{grade}</span>
                </div>
              </div>
            </div>
            <Progress value={result.percentage || 0} className="h-2 mt-4" />
            <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
              <span>Submitted: {new Date(result.submittedAt).toLocaleString()}</span>
              {result.autoSubmitted && <span className="text-yellow-600">(Auto-submitted)</span>}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Question-by-Question Breakdown</CardTitle>
            <CardDescription>
              {result.details.filter((q: DetailedQuestion) => q.isCorrect).length} correct, {" "}
              {result.details.filter((q: DetailedQuestion) => !q.isCorrect).length} incorrect
            </CardDescription>
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
                    
                    {/* Multiple choice options */}
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
                            <Circle className={`h-3 w-3 ${opt === q.userAnswer ? "fill-current" : ""}`} />
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

                    {/* True/False options */}
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
                            <Circle className={`h-3 w-3 ${val === q.userAnswer ? "fill-current" : ""}`} />
                            <span>{val ? "True" : "False"}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Student answered: <strong>{formatAnswer(q, q.userAnswer)}</strong>
                      {!q.isCorrect && (
                        <> • Correct answer: <strong className="text-green-600">{formatAnswer(q, q.correctAnswer)}</strong></>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Back button */}
        <Button variant="outline" asChild className="w-full">
          <Link href={`/classes/${classId}/quizzes/${quizId}/results`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Results
          </Link>
        </Button>
      </div>
    </div>
  )
}
