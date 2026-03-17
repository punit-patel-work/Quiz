"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  Save,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface DescriptiveAnswer {
  questionId: number
  questionText: string
  maxScore: number
  modelAnswer: string | null
  studentAnswer: string | null
  grade: {
    score: number
    maxScore: number
    feedback: string | null
  } | null
}

interface AttemptData {
  attemptId: string
  studentName: string
  studentEmail: string
  submittedAt: string
  gradingStatus: string
  autoGradedScore: number
  totalQuestions: number
  descriptiveAnswers: DescriptiveAnswer[]
  gradedCount: number
  totalDescriptive: number
  allGraded: boolean
}

export default function GradeQuizPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null)
  const [grades, setGrades] = useState<Map<string, Map<number, { score: number; feedback: string }>>>(new Map())
  const [savingAttempt, setSavingAttempt] = useState<string | null>(null)

  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const classId = params.id as string
  const quizId = params.quizId as string

  useEffect(() => {
    fetchGradingData()
  }, [classId, quizId])

  const fetchGradingData = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/quizzes/${quizId}/grade`)
      if (res.ok) {
        const result = await res.json()
        setData(result)

        // Initialize grades from existing data
        const initialGrades = new Map<string, Map<number, { score: number; feedback: string }>>()
        result.attempts.forEach((attempt: AttemptData) => {
          const attemptGrades = new Map<number, { score: number; feedback: string }>()
          attempt.descriptiveAnswers.forEach((da: DescriptiveAnswer) => {
            if (da.grade) {
              attemptGrades.set(da.questionId, {
                score: da.grade.score,
                feedback: da.grade.feedback || "",
              })
            } else {
              attemptGrades.set(da.questionId, {
                score: 0,
                feedback: "",
              })
            }
          })
          initialGrades.set(attempt.attemptId, attemptGrades)
        })
        setGrades(initialGrades)

        // Auto-expand the first pending attempt
        const firstPending = result.attempts.find((a: AttemptData) => !a.allGraded)
        if (firstPending) {
          setExpandedAttempt(firstPending.attemptId)
        }
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to load grading data" })
        router.push(`/classes/${classId}`)
      }
    } catch (error) {
      console.error("Failed to fetch grading data:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load grading data" })
    } finally {
      setIsLoading(false)
    }
  }

  const updateGrade = (attemptId: string, questionId: number, field: "score" | "feedback", value: string | number) => {
    setGrades((prev) => {
      const newGrades = new Map(prev)
      const attemptGrades = new Map(newGrades.get(attemptId) || new Map())
      const current = attemptGrades.get(questionId) || { score: 0, feedback: "" }
      attemptGrades.set(questionId, { ...current, [field]: value })
      newGrades.set(attemptId, attemptGrades)
      return newGrades
    })
  }

  const handleSaveGrades = async (attemptId: string) => {
    setSavingAttempt(attemptId)

    try {
      const attemptGrades = grades.get(attemptId)
      if (!attemptGrades) return

      const attempt = data.attempts.find((a: AttemptData) => a.attemptId === attemptId)
      if (!attempt) return

      const gradesArray = attempt.descriptiveAnswers.map((da: DescriptiveAnswer) => {
        const grade = attemptGrades.get(da.questionId) || { score: 0, feedback: "" }
        return {
          questionId: da.questionId,
          score: grade.score,
          maxScore: da.maxScore,
          feedback: grade.feedback,
        }
      })

      const res = await fetch(`/api/classes/${classId}/quizzes/${quizId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, grades: gradesArray }),
      })

      const result = await res.json()

      if (res.ok) {
        toast({
          title: result.allGraded ? "All Questions Graded!" : "Grades Saved",
          description: result.message,
        })
        // Refresh data
        fetchGradingData()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save grades",
      })
    } finally {
      setSavingAttempt(null)
    }
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

  if (!data) return null

  const progressPercentage = data.summary.total > 0
    ? (data.summary.graded / data.summary.total) * 100
    : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/classes/${classId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Grade Descriptive Answers</h1>
            <p className="text-muted-foreground">{data.quiz.name}</p>
          </div>
        </div>

        {/* Progress Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-0.5">
                <h3 className="font-semibold">Grading Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {data.summary.graded} of {data.summary.total} submissions graded
                </p>
              </div>
              <div className="text-2xl font-bold">
                {data.summary.graded}/{data.summary.total}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* No descriptive questions */}
        {data.descriptiveQuestions.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">This quiz has no descriptive questions to grade.</p>
            </CardContent>
          </Card>
        )}

        {/* No submissions */}
        {data.attempts.length === 0 && data.descriptiveQuestions.length > 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <User className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No submissions yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Attempts List */}
        <div className="space-y-4">
          {data.attempts.map((attempt: AttemptData) => (
            <Card key={attempt.attemptId} className={attempt.allGraded ? "border-green-200 dark:border-green-800" : ""}>
              {/* Attempt Header (always visible) */}
              <button
                onClick={() => setExpandedAttempt(
                  expandedAttempt === attempt.attemptId ? null : attempt.attemptId
                )}
                className="w-full text-left"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      attempt.allGraded 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : "bg-yellow-100 dark:bg-yellow-900/30"
                    }`}>
                      {attempt.allGraded 
                        ? <CheckCircle className="h-5 w-5 text-green-600" />
                        : <Clock className="h-5 w-5 text-yellow-600" />
                      }
                    </div>
                    <div>
                      <div className="font-medium">{attempt.studentName || attempt.studentEmail}</div>
                      <div className="text-sm text-muted-foreground">
                        Submitted {format(new Date(attempt.submittedAt), "MMM d, yyyy h:mm a")}
                        {" · "}
                        {attempt.gradedCount}/{attempt.totalDescriptive} graded
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      attempt.allGraded
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {attempt.allGraded ? "Graded" : "Pending"}
                    </span>
                    {expandedAttempt === attempt.attemptId
                      ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                </CardContent>
              </button>

              {/* Expanded Grading Section */}
              <AnimatePresence>
                {expandedAttempt === attempt.attemptId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t px-6 py-6 space-y-6">
                      {attempt.descriptiveAnswers.map((da: DescriptiveAnswer, idx: number) => {
                        const attemptGrades = grades.get(attempt.attemptId)
                        const currentGrade = attemptGrades?.get(da.questionId) || { score: 0, feedback: "" }

                        return (
                          <div key={da.questionId} className="space-y-4 pb-6 border-b last:border-b-0">
                            {/* Question */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold bg-muted px-2 py-1 rounded">
                                  Q{da.questionId}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Max: {da.maxScore} point{da.maxScore > 1 ? "s" : ""}
                                </span>
                              </div>
                              <p className="font-medium text-lg">{da.questionText}</p>
                            </div>

                            {/* Model Answer (if provided) */}
                            {da.modelAnswer && (
                              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                  Model Answer (Reference)
                                </p>
                                <p className="text-sm">{da.modelAnswer}</p>
                              </div>
                            )}

                            {/* Student's Answer */}
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">
                                Student's Answer
                              </p>
                              <p className="text-sm whitespace-pre-wrap">
                                {da.studentAnswer || <em className="text-muted-foreground">No answer provided</em>}
                              </p>
                            </div>

                            {/* Grading Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs">Score (0 - {da.maxScore})</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={da.maxScore}
                                  value={currentGrade.score}
                                  onChange={(e) => {
                                    const val = Math.min(da.maxScore, Math.max(0, parseInt(e.target.value) || 0))
                                    updateGrade(attempt.attemptId, da.questionId, "score", val)
                                  }}
                                />
                              </div>
                              <div className="md:col-span-3 space-y-2">
                                <Label className="text-xs">Feedback (optional)</Label>
                                <Textarea
                                  value={currentGrade.feedback}
                                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    updateGrade(attempt.attemptId, da.questionId, "feedback", e.target.value)
                                  }
                                  placeholder="Add feedback for the student..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleSaveGrades(attempt.attemptId)}
                          disabled={savingAttempt === attempt.attemptId}
                          className="px-6"
                        >
                          {savingAttempt === attempt.attemptId ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Grades
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
