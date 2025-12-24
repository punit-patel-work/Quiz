"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { 
  Mail, 
  Users, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Loader2,
  GraduationCap
} from "lucide-react"
import { format } from "date-fns"

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/invitations")
      if (res.ok) {
        const data = await res.json()
        setInvitations(data)
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId)

    try {
      const res = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: "POST",
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Invitation Accepted",
          description: `You've joined ${data.className}!`,
        })
        // Remove from list
        setInvitations(invitations.filter(i => i.id !== invitationId))
        // Optionally redirect to the class
        router.push(`/my-classes/${data.classId}`)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to accept invitation",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (invitationId: string) => {
    setProcessingId(invitationId)

    try {
      const res = await fetch(`/api/invitations/${invitationId}/reject`, {
        method: "POST",
      })

      if (res.ok) {
        toast({
          title: "Invitation Rejected",
          description: "The invitation has been declined.",
        })
        // Remove from list
        setInvitations(invitations.filter(i => i.id !== invitationId))
      } else {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject invitation",
      })
    } finally {
      setProcessingId(null)
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
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="h-8 w-8" />
            Class Invitations
          </h1>
          <p className="text-muted-foreground">
            Invitations to join classes from teachers
          </p>
        </div>

        {/* Invitations */}
        {invitations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending invitations</h3>
              <p className="text-muted-foreground">
                You'll see class invitations here when teachers invite you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{invitation.class.name}</CardTitle>
                        {invitation.class.description && (
                          <CardDescription className="mt-1">
                            {invitation.class.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      Teacher: <span className="font-medium text-foreground">
                        {invitation.class.teacher.name || invitation.class.teacher.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {invitation.class._count.members} students
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {invitation.class._count.quizzes} quizzes
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Invited on {format(new Date(invitation.createdAt), "MMMM d, yyyy")}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => handleAccept(invitation.id)}
                      disabled={processingId === invitation.id}
                    >
                      {processingId === invitation.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleReject(invitation.id)}
                      disabled={processingId === invitation.id}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
