"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, Download, RotateCcw, Users, Eye } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function QuizResultsPage() {
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retakeDialogOpen, setRetakeDialogOpen] = useState(false)
  const [retakeType, setRetakeType] = useState<"individual" | "class_wide">("individual")
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [retakeExpiry, setRetakeExpiry] = useState("")
  const [retakeReason, setRetakeReason] = useState("")
  const [granting, setGranting] = useState(false)
  const params = useParams()
  const { toast } = useToast()

  const classId = params.id as string
  const quizId = params.quizId as string

  useEffect(() => {
    fetchResults()
    // Set default expiry to 7 days from now
    const defaultExpiry = new Date()
    defaultExpiry.setDate(defaultExpiry.getDate() + 7)
    setRetakeExpiry(defaultExpiry.toISOString().slice(0, 16))
  }, [classId, quizId])

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/quizzes/${quizId}/results`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Failed to fetch results:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openRetakeDialog = (type: "individual" | "class_wide", member?: any) => {
    setRetakeType(type)
    setSelectedMember(member || null)
    setRetakeReason("")
    setRetakeDialogOpen(true)
  }

  const grantRetake = async () => {
    if (!retakeExpiry) {
      toast({ variant: "destructive", title: "Please set an expiry date" })
      return
    }

    setGranting(true)
    try {
      const res = await fetch(`/api/classes/${classId}/quizzes/${quizId}/retakes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: retakeType,
          memberId: selectedMember?.memberId,
          expiresAt: retakeExpiry,
          reason: retakeReason,
        }),
      })

      if (res.ok) {
        toast({
          title: "Retake Granted",
          description: retakeType === "class_wide"
            ? "All students can now retake this quiz"
            : `Retake granted to ${selectedMember?.name || selectedMember?.email}`,
        })
        setRetakeDialogOpen(false)
        fetchResults()
      } else {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to grant retake",
        description: error.message,
      })
    } finally {
      setGranting(false)
    }
  }

  const exportToCSV = () => {
    if (!results) return

    const headers = ["Name", "Email", "Status", "Score", "Percentage", "Started At", "Submitted At", "Auto-Submitted"]
    const rows = results.results.map((r: any) => [
      r.name || "",
      r.email,
      r.status,
      r.score ?? "",
      r.percentage ? `${r.percentage.toFixed(1)}%` : "",
      r.startedAt ? format(new Date(r.startedAt), "yyyy-MM-dd HH:mm:ss") : "",
      r.submittedAt ? format(new Date(r.submittedAt), "yyyy-MM-dd HH:mm:ss") : "",
      r.autoSubmitted ? "Yes" : "No",
    ])

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${results.quiz.name}-results.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Exported",
      description: "Results exported to CSV",
    })
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

  if (!results) return null

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/classes/${classId}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{results.quiz.name}</h1>
              <p className="text-muted-foreground">
                {results.quiz.totalQuestions} questions • {results.quiz.duration} min
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/classes/${classId}/quizzes/${quizId}/edit`}>
                Edit Quiz
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Grant Retake
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openRetakeDialog("class_wide")}>
                  <Users className="mr-2 h-4 w-4" />
                  All Students (Class-Wide)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{results.summary.totalStudents}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{results.summary.submitted}</div>
              <div className="text-sm text-muted-foreground">Submitted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {results.summary.attempted - results.summary.submitted}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{results.summary.notStarted}</div>
              <div className="text-sm text-muted-foreground">Not Started</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{results.summary.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Results</CardTitle>
            <CardDescription>Click on a student row to grant individual retake</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="py-3 px-2">Student</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-center">Score</th>
                    <th className="py-3 px-2 text-center">Percentage</th>
                    <th className="py-3 px-2">Submitted</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.results.map((r: any) => (
                    <tr key={r.memberId} className="hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium">{r.name || "—"}</div>
                          <div className="text-sm text-muted-foreground">{r.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={r.status} autoSubmitted={r.autoSubmitted} />
                      </td>
                      <td className="py-3 px-2 text-center">
                        {r.score !== null ? `${r.score}/${r.totalQuestions}` : "—"}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {r.percentage !== null ? (
                          <span className={
                            r.percentage >= 70 ? "text-green-600" :
                            r.percentage >= 50 ? "text-yellow-600" :
                            "text-red-600"
                          }>
                            {r.percentage.toFixed(1)}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {r.submittedAt ? format(new Date(r.submittedAt), "MMM d, h:mm a") : "—"}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {r.status === "submitted" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              title="View detailed answers"
                            >
                              <Link href={`/classes/${classId}/quizzes/${quizId}/student/${r.memberId}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {(r.status === "submitted" || r.status === "in_progress") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openRetakeDialog("individual", r)}
                              title={r.status === "in_progress" ? "Reset stuck quiz" : "Grant retake"}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Retake Dialog */}
        <Dialog open={retakeDialogOpen} onOpenChange={setRetakeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {retakeType === "class_wide" ? "Grant Class-Wide Retake" : "Grant Individual Retake"}
              </DialogTitle>
              <DialogDescription>
                {retakeType === "class_wide"
                  ? "All students who have submitted will be able to retake this quiz."
                  : `Grant a retake to ${selectedMember?.name || selectedMember?.email}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Retake Expires At</Label>
                <Input
                  id="expiry"
                  type="datetime-local"
                  value={retakeExpiry}
                  onChange={(e) => setRetakeExpiry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Technical issues during original attempt"
                  value={retakeReason}
                  onChange={(e) => setRetakeReason(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRetakeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={grantRetake} disabled={granting}>
                {granting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Grant Retake"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function StatusBadge({ status, autoSubmitted }: { status: string; autoSubmitted: boolean }) {
  if (status === "submitted") {
    return (
      <div className={`flex items-center gap-1 text-sm ${autoSubmitted ? "text-yellow-600" : "text-green-600"}`}>
        <CheckCircle className="h-4 w-4" />
        {autoSubmitted ? "Auto-submitted" : "Submitted"}
      </div>
    )
  }

  if (status === "in_progress") {
    return (
      <div className="flex items-center gap-1 text-sm text-yellow-600">
        <Clock className="h-4 w-4" />
        In Progress
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <XCircle className="h-4 w-4" />
      Not Given
    </div>
  )
}
