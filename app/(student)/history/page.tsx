"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, Calendar, Trophy, Clock } from "lucide-react"

interface QuizResult {
  id: string
  quizName: string
  score: number
  totalQuestions: number
  percentage: number
  createdAt: string
  timeTaken?: number
}

export default function HistoryPage() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/quiz-history")
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return "-"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quiz History</h1>
        <p className="text-sm text-muted-foreground">View your past quiz attempts and scores.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No quiz attempts yet.</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/setup">Take your first quiz</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.quizName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(result.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.score} / {result.totalQuestions}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={
                            result.percentage >= 80 ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" :
                            result.percentage >= 60 ? "text-amber-600 bg-amber-100 dark:bg-amber-900/30" :
                            "text-red-600 bg-red-100 dark:bg-red-900/30"
                          }
                        >
                          {Math.round(result.percentage)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/results?id=${result.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
