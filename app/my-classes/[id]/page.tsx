"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

export default function StudentClassPage() {
  const [classData, setClassData] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const classId = params.id as string

  useEffect(() => {
    fetchClassData()
    fetchQuizzes()
  }, [classId])

  const fetchClassData = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.isTeacher) {
          router.push(`/classes/${classId}`)
          return
        }
        setClassData(data)
      } else {
        router.push("/my-classes")
      }
    } catch (error) {
      console.error("Failed to fetch class:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/quizzes`)
      if (res.ok) {
        const data = await res.json()
        setQuizzes(data)
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
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

  if (!classData) return null

  const now = new Date()
  const activeQuizzes = quizzes.filter(q => 
    new Date(q.startTime) <= now && 
    new Date(q.endTime) > now && 
    q.canAttempt
  )
  const completedQuizzes = quizzes.filter(q => q.hasAttempted)
  const upcomingQuizzes = quizzes.filter(q => new Date(q.startTime) > now)
  const missedQuizzes = quizzes.filter(q => 
    new Date(q.endTime) <= now && 
    !q.hasAttempted
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/my-classes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{classData.name}</h1>
            <p className="text-muted-foreground">
              Teacher: {classData.teacher.name || classData.teacher.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{quizzes.length}</div>
              <div className="text-sm text-muted-foreground">Total Quizzes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedQuizzes.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{activeQuizzes.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{missedQuizzes.length}</div>
              <div className="text-sm text-muted-foreground">Missed</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Quizzes */}
        {activeQuizzes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Available Now
            </h2>
            {activeQuizzes.map((quiz) => (
              <Card key={quiz.id} className="border-green-200 dark:border-green-900">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{quiz.name}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span>{quiz.totalQuestions || (quiz.questions as any[]).length} questions</span>
                      <span>{quiz.duration} min</span>
                      <span className="text-red-500">
                        Ends {formatDistanceToNow(new Date(quiz.endTime), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/my-classes/${classId}/quiz/${quiz.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upcoming Quizzes */}
        {upcomingQuizzes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming
            </h2>
            {upcomingQuizzes.map((quiz) => (
              <Card key={quiz.id} className="border-blue-200 dark:border-blue-900">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{quiz.name}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span>{quiz.totalQuestions || (quiz.questions as any[]).length} questions</span>
                      <span>{quiz.duration} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Starts {formatDistanceToNow(new Date(quiz.startTime), { addSuffix: true })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(quiz.startTime), "MMM d, h:mm a")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Completed Quizzes */}
        {completedQuizzes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed
            </h2>
            {completedQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{quiz.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      {quiz.totalQuestions || (quiz.questions as any[]).length} questions • {quiz.duration} min
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {quiz.score !== undefined && quiz.score !== null ? (
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {quiz.percentage?.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {quiz.score} / {quiz.totalQuestions || (quiz.questions as any[]).length}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">In Progress</span>
                      </div>
                    )}
                    {quiz.score !== undefined && quiz.showResults && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/my-classes/${classId}/quiz/${quiz.id}/result`}>
                          View Results
                        </Link>
                      </Button>
                    )}
                    {quiz.hasRetake && (
                      <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={`/my-classes/${classId}/quiz/${quiz.id}`}>
                          Retake Quiz
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Missed Quizzes */}
        {missedQuizzes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Missed
            </h2>
            {missedQuizzes.map((quiz) => (
              <Card key={quiz.id} className="border-red-200 dark:border-red-900 opacity-75">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-muted-foreground">{quiz.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      {quiz.totalQuestions || (quiz.questions as any[]).length} questions • {quiz.duration} min
                    </div>
                  </div>
                  <div className="text-right text-sm text-red-500">
                    Expired {formatDistanceToNow(new Date(quiz.endTime), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {quizzes.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No quizzes in this class yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
