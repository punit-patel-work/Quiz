"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Upload, FileJson } from "lucide-react"
import { validateQuizJSON } from "@/lib/quiz-validator"

export default function CreateClassQuizPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [duration, setDuration] = useState(30)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [showResults, setShowResults] = useState(true)
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [fileName, setFileName] = useState("")
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const classId = params.id as string

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
      
      // Auto-set name from file if not set
      if (!name) {
        const baseName = file.name.replace(/\.json$/i, "")
        setName(baseName)
      }

      toast({
        title: "Quiz Loaded",
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

  const handleCreate = async () => {
    // Validate
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Quiz name is required" })
      return
    }
    if (questions.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Please upload quiz questions" })
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

    setIsCreating(true)

    try {
      const res = await fetch(`/api/classes/${classId}/quizzes`, {
        method: "POST",
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
          title: "Quiz Created",
          description: "Students can now take this quiz",
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
        description: error.message || "Failed to create quiz",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Set default times (now + 1 hour for start, now + 24 hours for end)
  const setDefaultTimes = () => {
    const now = new Date()
    const start = new Date(now.getTime() + 60 * 60 * 1000)
    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    setStartTime(start.toISOString().slice(0, 16))
    setEndTime(end.toISOString().slice(0, 16))
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
            <h1 className="text-3xl font-bold">Create Class Quiz</h1>
            <p className="text-muted-foreground">
              Upload questions and set a deadline for students
            </p>
          </div>
        </div>

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
                placeholder="e.g., Midterm Exam - Chapter 5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description or instructions..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>
              Upload a JSON file with quiz questions
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
                    <p className="font-medium">Click to upload quiz JSON</p>
                    <p className="text-sm text-muted-foreground">or drop file here</p>
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
            <CardDescription>
              Set when students can take the quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={setDefaultTimes}>
                Set Default Times
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  When quiz becomes available
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time (Deadline)</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Hard deadline - no submissions after
                </p>
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
              <p className="text-xs text-muted-foreground">
                Time limit per student (may be cut short by deadline)
              </p>
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

        {/* Create Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleCreate}
          disabled={isCreating || questions.length === 0}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Quiz...
            </>
          ) : (
            "Create Quiz"
          )}
        </Button>
      </div>
    </div>
  )
}
