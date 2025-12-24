"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Search, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"

export default function AdminQuizzesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchQuizzes()
  }, [page, search, statusFilter])

  const fetchQuizzes = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), search, status: statusFilter })
      const res = await fetch(`/api/admin/quizzes?${params}`)
      if (res.status === 403) {
        router.push("/dashboard")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setQuizzes(data.quizzes)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getQuizStatus = (quiz: any) => {
    const now = new Date()
    const start = new Date(quiz.startTime)
    const end = new Date(quiz.endTime)
    if (start > now) return { label: "Upcoming", color: "text-blue-600", icon: Clock }
    if (end > now) return { label: "Active", color: "text-green-600", icon: AlertCircle }
    return { label: "Ended", color: "text-muted-foreground", icon: CheckCircle }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">All Quizzes</h1>
              <p className="text-muted-foreground">
                {pagination?.total || 0} total quizzes
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "upcoming", "past"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => { setStatusFilter(s); setPage(1) }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Quizzes List */}
        <div className="space-y-3">
          {quizzes.map((quiz) => {
            const status = getQuizStatus(quiz)
            const StatusIcon = status.icon
            return (
              <Card key={quiz.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{quiz.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Class: {quiz.class.name} • Teacher: {quiz.class.teacher.name || quiz.class.teacher.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>{quiz.questionCount} questions</div>
                    <div>{quiz.duration} min</div>
                    <div>{quiz._count.attempts} attempts</div>
                    <div className={`flex items-center gap-1 ${status.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      {status.label}
                    </div>
                    <div className="text-muted-foreground">
                      {format(new Date(quiz.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {quizzes.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            No quizzes found
          </div>
        )}
      </div>
    </div>
  )
}
