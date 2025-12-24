"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Eye } from "lucide-react"

interface QuizResult {
  id: string
  score: number
  totalQuestions: number
  percentage: number
  createdAt: string
  quizName: string
}

interface LeaderboardProps {
  results: QuizResult[]
}

export function Leaderboard({ results }: LeaderboardProps) {
  const router = useRouter()

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 dark:text-green-400"
    if (percentage >= 75) return "text-blue-600 dark:text-blue-400"
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Quiz Name</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Percentage</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No quiz results yet
              </TableCell>
            </TableRow>
          ) : (
            results.map((result, index) => {
              const grade = getGrade(result.percentage)
              const gradeColor = getGradeColor(result.percentage)

              return (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {result.quizName || "Unnamed Quiz"}
                  </TableCell>
                  <TableCell>
                    {result.score}/{result.totalQuestions}
                  </TableCell>
                  <TableCell>
                    <span className={gradeColor}>
                      {result.percentage.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${gradeColor}`}
                    >
                      {grade}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(result.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/results?id=${result.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
