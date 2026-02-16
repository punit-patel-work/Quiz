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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Upload, FileJson, Layers, Edit } from "lucide-react"
import { validateQuizJSON } from "@/lib/quiz-validator"
import { QuizBuilder } from "@/components/quiz/quiz-builder"

export default function CreateClassQuizPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [duration, setDuration] = useState(30)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [showResults, setShowResults] = useState(true)
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [maxAttempts, setMaxAttempts] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [fileName, setFileName] = useState("")
  const [creationMethod, setCreationMethod] = useState("manual")
  
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
      toast({ variant: "destructive", title: "Error", description: "Please add at least one question" })
      return
    }
    if (!startTime || !endTime) {
      toast({ variant: "destructive", title: "Error", description: "Start and expiry times are required" })
      return
    }

    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (end <= start) {
      toast({ variant: "destructive", title: "Error", description: "Expiry time must be after start time" })
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
          maxAttempts,
        }),
      })

      if (res.ok) {
        toast({
          title: "Quiz Created!",
          description: "Students can now take this quiz.",
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/classes/${classId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Class Quiz</h1>
            <p className="text-muted-foreground">
              Configure quiz settings and add questions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Quiz Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Chapter 5 Test"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief instructions..."
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  Add questions manually or upload a file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={creationMethod} onValueChange={setCreationMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" /> Create Manually
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Upload JSON
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4">
                    <QuizBuilder questions={questions} setQuestions={setQuestions} />
                  </TabsContent>

                  <TabsContent value="upload">
                    <div className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-muted/5 transition-colors">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="quiz-upload"
                      />
                      <label htmlFor="quiz-upload" className="cursor-pointer block">
                        <FileJson className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        {fileName ? (
                          <div>
                            <p className="font-medium text-green-600">{fileName}</p>
                            <p className="text-sm text-muted-foreground mt-1">{questions.length} questions loaded</p>
                            <p className="text-xs text-muted-foreground mt-4">Click to replace file</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">Click to upload JSON file</p>
                            <p className="text-sm text-muted-foreground mt-1">Supports standard format</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Side Settings */}
          <div className="space-y-6">
            {/* Timing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule & Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" size="sm" onClick={setDefaultTimes} className="w-full text-xs mb-2">
                  Auto-fill Defaults
                </Button>
                
                <div className="space-y-2">
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">
                    Expiry Date (Deadline)
                  </Label>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs">Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="300"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Shuffle Questions</Label>
                    <p className="text-[10px] text-muted-foreground">Randomize order</p>
                  </div>
                  <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Show Results</Label>
                    <p className="text-[10px] text-muted-foreground">After submission</p>
                  </div>
                  <Switch checked={showResults} onCheckedChange={setShowResults} />
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Label className="text-sm">Max Attempts Allowed</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    1 = Single try, no retakes
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full font-bold shadow-md"
                onClick={handleCreate}
                disabled={isCreating || questions.length === 0}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Publish Quiz"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
