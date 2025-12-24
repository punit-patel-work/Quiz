"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { 
  UserCheck, 
  Loader2,
  ArrowLeft,
  Check,
  X,
  Clock,
  Building,
  FileText
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import Link from "next/link"
import { format } from "date-fns"

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      fetchApplications()
    }
  }, [statusFilter, status])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/teacher-applications?status=${statusFilter}`)
      if (res.status === 403) {
        router.push("/dashboard")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setApplications(data)
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (appId: string) => {
    setProcessing(appId)
    try {
      const res = await fetch(`/api/admin/teacher-applications/${appId}/approve`, {
        method: "POST",
      })

      if (res.ok) {
        toast({
          title: "Application Approved",
          description: "User has been granted teacher access",
        })
        fetchApplications()
      } else {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to approve",
        description: error.message,
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!selectedApp) return
    setProcessing(selectedApp.id)
    
    try {
      const res = await fetch(`/api/admin/teacher-applications/${selectedApp.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      })

      if (res.ok) {
        toast({
          title: "Application Rejected",
          description: "User has been notified",
        })
        setRejectDialogOpen(false)
        setSelectedApp(null)
        setRejectReason("")
        fetchApplications()
      } else {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to reject",
        description: error.message,
      })
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <UserCheck className="h-8 w-8" />
              Teacher Applications
            </h1>
            <p className="text-muted-foreground">
              Review and process teacher access requests
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "outline"}
            onClick={() => setStatusFilter("approved")}
          >
            <Check className="mr-2 h-4 w-4" />
            Approved
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            onClick={() => setStatusFilter("rejected")}
          >
            <X className="mr-2 h-4 w-4" />
            Rejected
          </Button>
        </div>

        {/* Applications */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No {statusFilter} applications
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{app.user.name || app.user.email}</CardTitle>
                      <CardDescription>{app.user.email}</CardDescription>
                    </div>
                    {statusFilter === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(app.id)}
                          disabled={processing === app.id}
                        >
                          {processing === app.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApp(app)
                            setRejectDialogOpen(true)
                          }}
                          disabled={processing === app.id}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Institution</p>
                        <p className="text-muted-foreground">{app.institution}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Applied</p>
                        <p className="text-muted-foreground">
                          {format(new Date(app.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Reason</p>
                      <p className="text-muted-foreground">{app.reason}</p>
                    </div>
                  </div>
                  {app.reviewNote && (
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <p className="font-medium">Review Note</p>
                      <p className="text-muted-foreground">{app.reviewNote}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this application. The user will see this message.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={processing !== null}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Reject Application"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
