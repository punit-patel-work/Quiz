"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FileUpload } from "@/components/quiz/file-upload"
import { QuizCard } from "@/components/quiz/quiz-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuizStore } from "@/lib/store"
import { Settings, Play, Library } from "lucide-react"

export default function SetupPage() {
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([])
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
  const [timeLimit, setTimeLimit] = useState(30)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setQuestions, setTimeLimit: setStoreTimeLimit, setQuizId, setQuizName } = useQuizStore()

  useEffect(() => {
    fetchSavedQuizzes()
    const quizIdParam = searchParams.get('quizId')
    if (quizIdParam) {
      setSelectedQuizId(quizIdParam)
    }
  }, [searchParams])

  const fetchSavedQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes")
      if (res.ok) {
        const quizzes = await res.json()
        setSavedQuizzes(quizzes)
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuizSaved = (quizId: string, quizName: string, data: any) => {
    setSelectedQuizId(quizId)
    fetchSavedQuizzes() // Refresh list
  }

  const handleBeginQuiz = async () => {
    if (!selectedQuizId) return

    try {
      const res = await fetch(`/api/quizzes/${selectedQuizId}`)
      if (res.ok) {
        const quiz = await res.json()
        setQuizId(selectedQuizId)
        setQuizName(quiz.name)
        setQuestions(quiz.questions)
        setStoreTimeLimit(timeLimit)
        router.push("/quiz")
      }
    } catch (error) {
      console.error("Failed to load quiz:", error)
    }
  }

  const handleQuizCardClick = (quizId: string) => {
    setSelectedQuizId(quizId)
  }

  const handleDeleteQuiz = () => {
    fetchSavedQuizzes() // Refresh list
    if (selectedQuizId && !savedQuizzes.find(q => q.id === selectedQuizId)) {
      setSelectedQuizId(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Setup Your Quiz</h1>
          <p className="text-muted-foreground">
            Choose a saved quiz or upload a new one
          </p>
        </div>

        {/* Saved Quizzes */}
        {savedQuizzes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Library className="h-5 w-5" />
                Your Saved Quizzes
              </h2>
              {savedQuizzes.length > 3 && (
                <Button
                  variant="link"
                  onClick={() => router.push("/dashboard")}
                  className="text-sm"
                >
                  View all ({savedQuizzes.length})
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedQuizzes.slice(0, 3).map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => handleQuizCardClick(quiz.id)}
                  className={`cursor-pointer transition-all ${
                    selectedQuizId === quiz.id ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <QuizCard
                    {...quiz}
                    onDelete={handleDeleteQuiz}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Quiz */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {savedQuizzes.length > 0 ? "+" : "1"}
            </span>
            Upload New Quiz
          </h2>
          <FileUpload onQuizSaved={handleQuizSaved} />
        </div>

        {/* Settings */}
        {selectedQuizId && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {savedQuizzes.length > 0 ? "⚙" : "2"}
              </span>
              Configure Settings
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quiz Settings
                </CardTitle>
                <CardDescription>
                  Set your preferences for this quiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">
                    Time Limit (minutes)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    max="180"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 30 minutes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Begin Button */}
        {selectedQuizId && (
          <Card className="border-2 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Ready to Begin?</h3>
                  <p className="text-sm text-muted-foreground">
                    Quiz selected • {timeLimit} minutes
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleBeginQuiz}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Begin Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
