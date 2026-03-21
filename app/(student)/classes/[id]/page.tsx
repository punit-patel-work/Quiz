"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  Eye,
  Plus,
  Play,
  MoreVertical,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Activity
} from "lucide-react"
import { FileText } from "lucide-react"
import { format } from "date-fns"

export default function ClassDashboardPage() {
  const [classData, setClassData] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [emailsToInvite, setEmailsToInvite] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [copied, setCopied] = useState(false)

  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [taCreateQuizzes, setTaCreateQuizzes] = useState(false)
  const [taGradeScores, setTaGradeScores] = useState(false)
  const [taGrantRetakes, setTaGrantRetakes] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const classId = params.id as string

  useEffect(() => {
    fetchClassData()
    fetchMembers()
    fetchQuizzes()
    fetchInvitations()
    fetchActivities()
  }, [classId])

  const fetchClassData = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`)
      if (res.ok) {
        const data = await res.json()
        if (!data.isTeacher && data.memberRole !== "assistant") {
          router.push("/my-classes")
          return
        }
        setClassData(data)
        setEditName(data.name || "")
        setEditDescription(data.description || "")
        setTaCreateQuizzes(data.allowTaCreateEditQuizzes || false)
        setTaGradeScores(data.allowTaGradeScores || false)
        setTaGrantRetakes(data.allowTaGrantRetakes || false)
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

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/activity`)
      if (res.ok) {
        const data = await res.json()
        setActivities(data)
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
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

  const handleUpdateRole = async (memberId: string, role: string) => {
    try {
      const res = await fetch(`/api/classes/${classId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      if (res.ok) {
        toast({
          title: role === "assistant" ? "Promoted to TA" : "TA Role Removed",
          description: role === "assistant" ? "Student is now a Teaching Assistant." : "Student is now a regular student.",
          className: role === "assistant" ? "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" : "",
        })
        fetchMembers()
      } else {
        toast({ variant: "destructive", title: "Error updating role" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to update role" })
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

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          allowTaCreateEditQuizzes: taCreateQuizzes,
          allowTaGradeScores: taGradeScores,
          allowTaGrantRetakes: taGrantRetakes
        }),
      })

      if (res.ok) {
        toast({ title: "Settings saved successfully" })
        fetchClassData()
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to save settings" })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const copyClassCode = () => {
    navigator.clipboard.writeText(classData?.code || "")
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Class code copied to clipboard",
      className: "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-4 text-center flex flex-col items-center justify-center space-y-2">
                  <Skeleton className="h-10 w-12" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!classData) return null

  const isTeacher = classData.isTeacher
  const isTA = classData.memberRole === "assistant"
  const canCreateEditQuizzes = isTeacher || (isTA && classData.allowTaCreateEditQuizzes)

  const now = new Date()
  const activeQuizzes = quizzes.filter(q => new Date(q.startTime) <= now && new Date(q.endTime) > now)
  const upcomingQuizzes = quizzes.filter(q => new Date(q.startTime) > now)
  const pastQuizzes = quizzes.filter(q => new Date(q.endTime) <= now)

  const taPermissions = {
    canCreateEdit: canCreateEditQuizzes,
    canGrade: isTeacher || (isTA && classData.allowTaGradeScores),
    isTeacher
  }

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
            {isTeacher && (
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
            )}

            {isTeacher && (
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
            )}
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
            {isTeacher && (
              <>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Activity Log
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Class Quizzes</h2>
              {canCreateEditQuizzes ? (
                <Button asChild>
                  <Link href={`/classes/${classId}/quizzes/create`}>
                    Create Quiz
                  </Link>
                </Button>
              ) : (
                <Button disabled title="You do not have permission to create quizzes">
                  Create Quiz
                </Button>
              )}
            </div>

            {quizzes.length === 0 ? (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="py-12 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No quizzes yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Create your first quiz to engage your students and track their progress.
                  </p>
                  {canCreateEditQuizzes && (
                    <div className="pt-4">
                      <Button asChild>
                        <Link href={`/classes/${classId}/quizzes/create`}>
                          <Plus className="mr-2 h-5 w-5" />
                          Create Your First Quiz
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeQuizzes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-green-600">Active Now</h3>
                    {activeQuizzes.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} classId={classId} onDelete={fetchQuizzes} permissions={taPermissions} />
                    ))}
                  </div>
                )}
                {upcomingQuizzes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-600">Upcoming</h3>
                    {upcomingQuizzes.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} classId={classId} onDelete={fetchQuizzes} permissions={taPermissions} />
                    ))}
                  </div>
                )}
                {pastQuizzes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-muted-foreground">Past</h3>
                    {pastQuizzes.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} classId={classId} onDelete={fetchQuizzes} permissions={taPermissions} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            {members.length === 0 ? (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="py-12 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No students yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Invite students to this class so they can access your quizzes.
                  </p>
                  <div className="pt-4">
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Invite Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <Card key={member.id} className={member.role === "assistant" ? "border-blue-200 dark:border-blue-800" : ""}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                           <span className="font-medium">{member.name || member.email}</span>
                           {member.role === "assistant" && (
                             <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Teaching Assistant</Badge>
                           )}
                        </div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground hidden sm:block">
                          {member.quizzesAttempted}/{member.totalQuizzes} quizzes
                        </div>
                        
                        {/* Member Actions */}
                        {isTeacher && (
                          <div className="flex items-center gap-1">
                            {member.role === "student" ? (
                              <Button variant="outline" size="sm" onClick={() => handleUpdateRole(member.id, "assistant")} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Make TA
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleUpdateRole(member.id, "student")} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-300">
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Remove TA
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Remove student from class">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove {member.name || "Student"}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove them from the class and delete their quiz attempts.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveMember(member.id)} className="bg-destructive text-destructive-foreground">
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
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
              <Card className="border-dashed bg-muted/30">
                <CardContent className="py-12 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No pending invitations</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    You haven't sent any invitations yet, or all students have already joined.
                  </p>
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

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-4">
            {activities.length === 0 ? (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="py-12 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No activity yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    TA actions and other class activities will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="mt-0.5 bg-muted p-2 rounded-full">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            <span className="font-semibold">{activity.actor.name || activity.actor.email}</span>
                            {" "}
                            <span className="text-sm text-muted-foreground">({activity.actorRole === "assistant" ? "TA" : "Teacher"})</span>
                          </p>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          {activity.action === "make_ta" && "Promoted a student to Teaching Assistant"}
                          {activity.action === "remove_ta" && "Removed Teaching Assistant role from a student"}
                          {activity.action === "create_quiz" && "Created a new quiz"}
                          {activity.action === "update_quiz" && "Updated a quiz's settings"}
                          {activity.action === "update_score" && "Modified a student's score"}
                          {activity.action === "grant_retake" && "Granted a quiz retake"}
                          {activity.action === "apply_correction" && "Applied a question correction"}
                          {!["make_ta", "remove_ta", "create_quiz", "update_quiz", "update_score", "grant_retake", "apply_correction"].includes(activity.action) && `Performed action: ${activity.action}`}
                        </p>
                        {activity.details && (
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto text-muted-foreground">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Overview</CardTitle>
                <CardDescription>Manage your class details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teaching Assistant Permissions</CardTitle>
                <CardDescription>Delegate responsibilities to TAs assigned to this class.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Create & Edit Quizzes</Label>
                    <p className="text-sm text-muted-foreground">Allow TAs to build, modify, and delete questions.</p>
                  </div>
                  <Switch checked={taCreateQuizzes} onCheckedChange={setTaCreateQuizzes} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Grade & Modify Scores</Label>
                    <p className="text-sm text-muted-foreground">Allow TAs to score descriptive answers and give bonus points.</p>
                  </div>
                  <Switch checked={taGradeScores} onCheckedChange={setTaGradeScores} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Grant Retakes</Label>
                    <p className="text-sm text-muted-foreground">Allow TAs to grant individual or class-wide retakes.</p>
                  </div>
                  <Switch checked={taGrantRetakes} onCheckedChange={setTaGrantRetakes} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function QuizCard({ 
  quiz, 
  classId, 
  onDelete, 
  permissions 
}: { 
  quiz: any; 
  classId: string; 
  onDelete?: () => void;
  permissions?: { canCreateEdit: boolean; canGrade: boolean; isTeacher: boolean }
}) {
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
          {permissions?.canCreateEdit ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/classes/${classId}/quizzes/${quiz.id}/edit`}>
                <Settings className="mr-1 h-3 w-3" />
                Edit
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled title="You do not have permission to edit quizzes">
              <Settings className="mr-1 h-3 w-3" />
              Edit
            </Button>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link href={`/classes/${classId}/quizzes/${quiz.id}/results`}>
              <Eye className="mr-1 h-3 w-3" />
              Results
            </Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/classes/${classId}/quizzes/${quiz.id}/preview`}>
              <Play className="mr-1 h-3 w-3" />
              Preview
            </Link>
          </Button>

          {(quiz.questions as any[]).some((q: any) => q.type === "descriptive") && (
            permissions?.canGrade ? (
              <Button variant="outline" size="sm" asChild className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30">
                <Link href={`/classes/${classId}/quizzes/${quiz.id}/grade`}>
                  <FileText className="mr-1 h-3 w-3" />
                  Grade
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled title="You do not have permission to grade quizzes" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30">
                <FileText className="mr-1 h-3 w-3" />
                Grade
              </Button>
            )
          )}

          {permissions?.canCreateEdit ? (
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
          ) : (
            <Button variant="ghost" size="sm" disabled title="You do not have permission to delete quizzes">
              <Trash2 className="h-4 w-4 text-destructive opacity-50" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

