"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Upload, FileJson, Save, AlertTriangle } from "lucide-react"
import { validateQuizJSON } from "@/lib/quiz-validator"

export default function EditClassQuizPage() {
  const [quiz, setQuiz] = useState<any>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [duration, setDuration] = useState(30)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [showResults, setShowResults] = useState(true)
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fileName, setFileName] = useState("")
  const [hasActiveAttempts, setHasActiveAttempts] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const classId = params.id as string
  const quizId = params.quizId as string

  useEffect(() => {
    fetchQuiz()
  }, [classId, quizId])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/quizzes/${quizId}`)
      if (res.ok) {
        const data = await res.json()
        setQuiz(data)
        setName(data.name)
        setDescription(data.description || "")
        setQuestions(data.questions)
        setDuration(data.duration)
        setStartTime(new Date(data.startTime).toISOString().slice(0, 16))
        setEndTime(new Date(data.endTime).toISOString().slice(0, 16))
        setShowResults(data.showResults)
        setShuffleQuestions(data.shuffleQuestions)

        // Check for active attempts
        const attemptsRes = await fetch(`/api/classes/${classId}/quizzes/${quizId}/results`)
        if (attemptsRes.ok) {
          const attemptsData = await attemptsRes.json()
          const active = attemptsData.results?.some((r: any) => r.status === "in_progress")
          setHasActiveAttempts(active)
        }
      } else {
        router.push(`/classes/${classId}`)
      }
    } catch (error) {
      console.error("Failed to fetch quiz:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const data = JSON.parse(content)
      const validation = validateQuizJSON(data)

      if (!validation.success) {
        toast({
          variant: "destructive",
          title: "Invalid Quiz Format",
          description: "Please check your JSON format",
        })
        return
      }

      setQuestions(validation.data || [])
      setFileName(file.name)

      toast({
        title: "Questions Updated",
        description: `${validation.data?.length} questions loaded from file`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to parse JSON file",
      })
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Quiz name is required" })
      return
    }
    if (questions.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Questions are required" })
      return
    }
    if (!startTime || !endTime) {
      toast({ variant: "destructive", title: "Error", description: "Start and end times are required" })
      return
    }

    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (end <= start) {
      toast({ variant: "destructive", title: "Error", description: "End time must be after start time" })
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch(`/api/classes/${classId}/quizzes/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          questions,
          duration,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          showResults,
          shuffleQuestions,
        }),
      })

      if (res.ok) {
        toast({
          title: "Quiz Updated",
          description: "Changes saved successfully",
        })
        router.push(`/classes/${classId}`)
      } else {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update quiz",
      })
    } finally {
      setIsSaving(false)
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/classes/${classId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Quiz</h1>
            <p className="text-muted-foreground">
              Modify quiz settings and questions
            </p>
          </div>
        </div>

        {/* Active Attempts Warning */}
        {hasActiveAttempts && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Students are currently taking this quiz
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Changes to questions may affect ongoing attempts
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Details */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Quiz Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>
              Current: {questions.length} questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="quiz-upload"
              />
              <label htmlFor="quiz-upload" className="cursor-pointer">
                <FileJson className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                {fileName ? (
                  <div>
                    <p className="font-medium">{fileName}</p>
                    <p className="text-sm text-green-600">{questions.length} questions loaded</p>
                    <p className="text-sm text-muted-foreground mt-2">Click to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Upload new questions</p>
                    <p className="text-sm text-muted-foreground">Click to upload new JSON file</p>
                  </div>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Timing */}
        <Card>
          <CardHeader>
            <CardTitle>Timing & Deadline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time (Deadline)</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="300"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Results to Students</Label>
                <p className="text-sm text-muted-foreground">
                  Students can see their score after submission
                </p>
              </div>
              <Switch checked={showResults} onCheckedChange={setShowResults} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Shuffle Questions</Label>
                <p className="text-sm text-muted-foreground">
                  Randomize question order for each student
                </p>
              </div>
              <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
