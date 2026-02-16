"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Trophy, Target, TrendingUp, BookOpen, 
  Clock, Calendar, ArrowRight, Loader2, CheckCircle,
  AlertCircle, Plus
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface StudentStats {
  stats: {
    totalQuizzes: number
    averageScore: number
    bestScore: number
    pendingCount: number
  }
  pendingQuizzes: Array<{
    id: string
    quizId: string
    title: string
    class: string
    dueDate: string | null
    timeLimit: number
  }>
  recentActivity: Array<{
    id: string
    quizName: string
    score: number
    totalQuestions: number
    percentage: number
    createdAt: string
  }>
}

export function StudentDashboard() {
  const [data, setData] = useState<StudentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/student/stats")
      if (res.status === 401) {
        // Handle auth externally or here
        return
      }
      if (res.ok) {
        const statsData = await res.json()
        setData(statsData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statCards = [
    {
      label: "TOTAL QUIZZES",
      value: data?.stats.totalQuizzes || 0,
      Icon: Trophy,
      gradient: "from-blue-500/10 to-cyan-500/10",
      border: "border-blue-200 dark:border-blue-800/50",
      iconColor: "text-blue-600",
      badgeBg: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      label: "AVERAGE SCORE",
      value: `${data?.stats.averageScore || 0}%`,
      Icon: Target,
      gradient: "from-emerald-500/10 to-teal-500/10",
      border: "border-emerald-200 dark:border-emerald-800/50",
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    },
    {
      label: "BEST SCORE",
      value: `${data?.stats.bestScore || 0}%`,
      Icon: TrendingUp,
      gradient: "from-violet-500/10 to-purple-500/10",
      border: "border-violet-200 dark:border-violet-800/50",
      iconColor: "text-violet-600",
      badgeBg: "bg-violet-100 dark:bg-violet-900/50",
    },
    {
      label: "PENDING",
      value: data?.stats.pendingCount || 0,
      Icon: Clock,
      gradient: "from-amber-500/10 to-orange-500/10",
      border: "border-amber-200 dark:border-amber-800/50",
      iconColor: "text-amber-600",
      badgeBg: "bg-amber-100 dark:bg-amber-900/50",
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's your progress.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/my-classes">
              <BookOpen className="mr-2 h-4 w-4" />
              Join Class
            </Link>
          </Button>
          <Button asChild>
            <Link href="/setup">
              <Plus className="mr-2 h-4 w-4" />
              New Quiz
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className={`bg-gradient-to-br ${card.gradient} ${card.border} overflow-hidden relative`}>
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-1">{card.label}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.badgeBg}`}>
                  <card.Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Pending Quizzes Section - Takes up 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pending Quizzes
            </h2>
            {data?.pendingQuizzes?.length ? (
               <span className="text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
                 {data.pendingQuizzes.length} Due
               </span>
            ) : null}
          </div>

          {!data?.pendingQuizzes?.length ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-sm text-muted-foreground">You have no pending quizzes from your classes.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/setup">Practice on your own →</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.pendingQuizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                      <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{quiz.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> {quiz.class}
                        </span>
                        {quiz.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(quiz.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {quiz.timeLimit}m
                        </span>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/my-classes/${quiz.class}/quiz/${quiz.quizId}`}>
                        Start <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Section - Takes up 1 column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Recent Activity
            </h2>
            <Button variant="link" size="sm" asChild className="px-0">
              <Link href="/my-classes">View All</Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {!data?.recentActivity?.length ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="divide-y">
                  {data.recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium truncate max-w-[150px]" title={activity.quizName}>
                          {activity.quizName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={activity.percentage} className="h-2 flex-1" />
                        <span className={`text-sm font-bold ${
                          activity.percentage >= 80 ? "text-emerald-600" : 
                          activity.percentage >= 60 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {Math.round(activity.percentage)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tip Card */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Pro Tip
              </h3>
              <p className="text-sm text-indigo-100 mb-4">
                Consistency is key! Try taking one quiz each day to improve your retention.
              </p>
              <Button size="sm" variant="secondary" className="w-full text-indigo-600" asChild>
                <Link href="/setup">Practice Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
