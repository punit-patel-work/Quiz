"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaderboard } from "@/components/quiz/leaderboard"
import { Trophy, Target, TrendingUp, Play } from "lucide-react"

interface QuizHistory {
  id: string
  score: number
  totalQuestions: number
  percentage: number
  createdAt: string
  quizName: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
  })
  const [history, setHistory] = useState<QuizHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchQuizHistory()
  }, [])

  const fetchQuizHistory = async () => {
    try {
      const res = await fetch("/api/quiz-history")
      if (res.ok) {
        const data: QuizHistory[] = await res.json()
        setHistory(data)

        // Calculate stats
        if (data.length > 0) {
          const totalQuizzes = data.length
          const averageScore =
            data.reduce((sum, quiz) => sum + quiz.percentage, 0) / totalQuizzes
          const bestScore = Math.max(...data.map((quiz) => quiz.percentage))

          setStats({
            totalQuizzes,
            averageScore,
            bestScore,
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch quiz history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your quiz performance and history
            </p>
          </div>
          <Button onClick={() => router.push("/setup")} size="lg">
            <Play className="mr-2 h-5 w-5" />
            Start Quiz
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Quizzes
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                Completed assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageScore.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all quizzes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bestScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Your highest score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quiz History */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz History</CardTitle>
            <CardDescription>
              Your recent quiz attempts and scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">
                Loading...
              </p>
            ) : history.length > 0 ? (
              <Leaderboard results={history} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No quiz history yet. Start your first quiz!
                </p>
                <Button onClick={() => router.push("/setup")}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
