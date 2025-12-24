"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, ArrowLeft, Home, Loader2 } from "lucide-react"

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
      // Get member's attempt for this quiz
      const res = await fetch(`/api/my-classes/${classId}/quizzes/${quizId}/result`)
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        // No result found, redirect back
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
      <div className="max-w-lg mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <CardDescription>
              {result.quizName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-6xl font-bold text-primary">
                {result.score}/{result.totalQuestions}
              </div>
              <div className="text-2xl font-semibold">
                {(result.percentage || 0).toFixed(1)}% - Grade: <span className={color}>{grade}</span>
              </div>
              <Progress value={result.percentage || 0} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center pt-4">
              <div>
                <div className="text-2xl font-bold text-green-600">{result.score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{result.totalQuestions - result.score}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>

            {result.submittedAt && (
              <div className="text-sm text-muted-foreground pt-2">
                Submitted: {new Date(result.submittedAt).toLocaleString()}
              </div>
            )}

            <div className="flex gap-3 pt-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
