"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Users, GraduationCap, BookOpen, Clock, 
  ArrowRight, Loader2, Plus, Calendar
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface TeacherStats {
  stats: {
    totalClasses: number
    totalStudents: number
    totalQuizzesCreated: number
    activeQuizzesCount: number
  }
  recentSubmissions: Array<{
    id: string
    studentName: string
    quizTitle: string
    className: string
    score: number
    totalQuestions: number
    submittedAt: string
  }>
}

export function TeacherDashboard() {
  const [data, setData] = useState<TeacherStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/teacher/stats")
      if (res.ok) {
        const statsData = await res.json()
        setData(statsData)
      }
    } catch (error) {
      console.error("Failed to fetch teacher stats:", error)
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
      label: "TOTAL CLASSES",
      value: data?.stats.totalClasses || 0,
      Icon: GraduationCap,
      gradient: "from-blue-500/10 to-indigo-500/10",
      border: "border-blue-200 dark:border-blue-800/50",
      iconColor: "text-blue-600",
      badgeBg: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      label: "TOTAL STUDENTS",
      value: data?.stats.totalStudents || 0,
      Icon: Users,
      gradient: "from-purple-500/10 to-pink-500/10",
      border: "border-purple-200 dark:border-purple-800/50",
      iconColor: "text-purple-600",
      badgeBg: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      label: "QUIZZES CREATED",
      value: data?.stats.totalQuizzesCreated || 0,
      Icon: BookOpen,
      gradient: "from-emerald-500/10 to-teal-500/10",
      border: "border-emerald-200 dark:border-emerald-800/50",
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    },
    {
      label: "ACTIVE QUIZZES",
      value: data?.stats.activeQuizzesCount || 0,
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
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your classes and view student activity.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/classes">
              <Plus className="mr-2 h-4 w-4" />
              Create Class
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recent Submissions
            </h2>
          </div>

          <Card>
            <CardContent className="p-0">
              {!data?.recentSubmissions?.length ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No recent submissions found.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {data.recentSubmissions.map((sub) => (
                    <div key={sub.id} className="p-4 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium">{sub.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted <strong>{sub.quizTitle}</strong> in {sub.className}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {sub.score}/{sub.totalQuestions}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/classes/${sub.className}/quizzes/${sub.quizTitle}/results`}>
                             <ArrowRight className="h-4 w-4" />
                          </Link>
                          {/* Note: The above link is approximate, ideally we link to specific result */}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-semibold">Tips</h2>
          </div>
          
           <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Engage Students
              </h3>
              <p className="text-sm text-indigo-100 mb-4">
                Create variety in your quizzes! Try adding True/False and Fill-in-the-blank questions to test different skills.
              </p>
              <Button size="sm" variant="secondary" className="w-full text-indigo-600" asChild>
                <Link href="/classes">Go to Classes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
