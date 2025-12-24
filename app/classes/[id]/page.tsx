"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  Settings, 
  UserPlus,
  Trash2,
  Loader2,
  Mail,
  Clock,
  Copy,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react"
import { format } from "date-fns"

export default function ClassDashboardPage() {
  const [classData, setClassData] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [emailsToInvite, setEmailsToInvite] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [copied, setCopied] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const classId = params.id as string

  useEffect(() => {
    fetchClassData()
    fetchMembers()
    fetchQuizzes()
    fetchInvitations()
  }, [classId])

  const fetchClassData = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`)
      if (res.ok) {
        const data = await res.json()
        if (!data.isTeacher) {
          router.push("/my-classes")
          return
        }
        setClassData(data)
      } else {
        router.push("/classes")
      }
    } catch (error) {
      console.error("Failed to fetch class:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      console.error("Failed to fetch members:", error)
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

  const fetchInvitations = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/invite`)
      if (res.ok) {
        const data = await res.json()
        setInvitations(data)
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error)
    }
  }

  const handleInvite = async () => {
    const emails = emailsToInvite
      .split(/[,\n]/)
      .map(e => e.trim())
      .filter(e => e.length > 0)

    if (emails.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter at least one email address",
      })
      return
    }

    setIsInviting(true)

    try {
      const res = await fetch(`/api/classes/${classId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      })

      const data = await res.json()

      if (res.ok) {
        const { invited, alreadyMember, alreadyInvited } = data.results
        let message = ""
        if (invited.length > 0) message += `${invited.length} invitation(s) sent. `
        if (alreadyMember.length > 0) message += `${alreadyMember.length} already member(s). `
        if (alreadyInvited.length > 0) message += `${alreadyInvited.length} already invited. `

        toast({
          title: "Invitations Processed",
          description: message || "All done!",
        })
        setInviteDialogOpen(false)
        setEmailsToInvite("")
        fetchInvitations()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invitations",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/classes/${classId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Member Removed",
          description: "Student has been removed from the class",
        })
        fetchMembers()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member",
      })
    }
  }

  const handleDeleteClass = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Class Deleted",
          description: "The class has been deleted",
        })
        router.push("/classes")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete class",
      })
    }
  }

  const copyClassCode = () => {
    navigator.clipboard.writeText(classData?.code || "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
  const activeQuizzes = quizzes.filter(q => new Date(q.startTime) <= now && new Date(q.endTime) > now)
  const upcomingQuizzes = quizzes.filter(q => new Date(q.startTime) > now)
  const pastQuizzes = quizzes.filter(q => new Date(q.endTime) <= now)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/classes">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{classData.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Class Code:</span>
                  <button
                    onClick={copyClassCode}
                    className="font-mono bg-muted px-2 py-0.5 rounded hover:bg-muted/80 flex items-center gap-1"
                  >
                    {classData.code}
                    {copied ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Students
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Students</DialogTitle>
                  <DialogDescription>
                    Enter email addresses separated by commas or new lines
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder="student1@email.com, student2@email.com..."
                    value={emailsToInvite}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailsToInvite(e.target.value)}
                    rows={5}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={isInviting}>
                    {isInviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Invitations
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the class, all quizzes, and student data. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClass} className="bg-destructive text-destructive-foreground">
                    Delete Class
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{members.length}</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{quizzes.length}</div>
              <div className="text-sm text-muted-foreground">Quizzes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{activeQuizzes.length}</div>
              <div className="text-sm text-muted-foreground">Active Now</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {invitations.filter(i => i.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Invites</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="quizzes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="quizzes" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Students ({members.length})
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              <Mail className="h-4 w-4" />
              Invitations
            </TabsTrigger>
          </TabsList>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Class Quizzes</h2>
              <Button asChild>
                <Link href={`/classes/${classId}/quizzes/create`}>
                  Create Quiz
                </Link>
              </Button>
            </div>

            {quizzes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No quizzes yet. Create your first quiz!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeQuizzes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-green-600">Active Now</h3>
                    {activeQuizzes.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} classId={classId} onDelete={fetchQuizzes} />
                    ))}
                  </div>
                )}
                {upcomingQuizzes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-600">Upcoming</h3>
                    {upcomingQuizzes.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} classId={classId} onDelete={fetchQuizzes} />
                    ))}
                  </div>
                )}
                {pastQuizzes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-muted-foreground">Past</h3>
                    {pastQuizzes.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} classId={classId} onDelete={fetchQuizzes} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            {members.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No students yet. Invite some!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{member.name || member.email}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {member.quizzesAttempted}/{member.totalQuizzes} quizzes
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Student?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the student from the class. Their quiz attempts will be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="space-y-4">
            {invitations.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No invitations sent yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <Card key={inv.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{inv.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Sent {format(new Date(inv.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${
                        inv.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        inv.status === "accepted" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {inv.status === "pending" && <Clock className="h-3 w-3" />}
                        {inv.status === "accepted" && <CheckCircle className="h-3 w-3" />}
                        {inv.status === "rejected" && <XCircle className="h-3 w-3" />}
                        {inv.status}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function QuizCard({ quiz, classId, onDelete }: { quiz: any; classId: string; onDelete?: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const now = new Date()
  const startTime = new Date(quiz.startTime)
  const endTime = new Date(quiz.endTime)
  const isActive = startTime <= now && endTime > now
  const isPast = endTime <= now

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/classes/${classId}/quizzes/${quiz.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast({ title: "Quiz deleted successfully" })
        onDelete?.()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete quiz" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="font-medium">{quiz.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span>{(quiz.questions as any[]).length} questions</span>
            <span>{quiz.duration} min</span>
            <span>
              {isPast ? "Ended" : isActive ? "Ends" : "Starts"}{" "}
              {format(isPast ? endTime : isActive ? endTime : startTime, "MMM d, h:mm a")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {quiz._count?.attempts || 0} attempts
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/classes/${classId}/quizzes/${quiz.id}/edit`}>
              <Settings className="mr-1 h-3 w-3" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/classes/${classId}/quizzes/${quiz.id}/results`}>
              <Eye className="mr-1 h-3 w-3" />
              Results
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{quiz.name}" and all student attempts. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Quiz"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

