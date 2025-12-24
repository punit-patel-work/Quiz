"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { 
  GraduationCap, 
  Loader2,
  Building,
  FileText,
  Check,
  Clock,
  X,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function BecomeTeacherPage() {
  const [application, setApplication] = useState<any>(null)
  const [institution, setInstitution] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchApplication()
  }, [])

  const fetchApplication = async () => {
    try {
      const res = await fetch("/api/teacher-application")
      if (res.ok) {
        const data = await res.json()
        setApplication(data)
      }
    } catch (error) {
      console.error("Failed to fetch application:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!institution.trim() || !reason.trim()) {
      toast({
        variant: "destructive",
        title: "All fields required",
        description: "Please fill in all fields",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/teacher-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institution, reason }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.status === "approved") {
          toast({
            title: "🎉 Auto-Approved!",
            description: data.message,
          })
          router.push("/classes")
        } else {
          toast({
            title: "Application Submitted",
            description: data.message,
          })
          fetchApplication()
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to submit",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
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

  // Show status if already applied
  if (application) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <Card className="text-center">
            <CardHeader>
              {application.status === "pending" && (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <CardTitle>Application Pending</CardTitle>
                  <CardDescription>
                    Your teacher application is being reviewed
                  </CardDescription>
                </>
              )}
              {application.status === "approved" && (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>You're a Teacher!</CardTitle>
                  <CardDescription>
                    Your application was approved
                  </CardDescription>
                </>
              )}
              {application.status === "rejected" && (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle>Application Rejected</CardTitle>
                  <CardDescription>
                    Unfortunately your application was not approved
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-left bg-muted p-4 rounded-lg">
                <p><strong>Institution:</strong> {application.institution}</p>
                <p><strong>Reason:</strong> {application.reason}</p>
                {application.reviewNote && (
                  <p className="mt-2 pt-2 border-t">
                    <strong>Admin Note:</strong> {application.reviewNote}
                  </p>
                )}
              </div>
              
              {application.status === "approved" && (
                <Button className="w-full" asChild>
                  <Link href="/classes">
                    Go to My Classes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              
              {application.status === "rejected" && (
                <Button 
                  className="w-full" 
                  onClick={() => setApplication(null)}
                >
                  Apply Again
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Become a Teacher</h1>
          <p className="text-muted-foreground mt-2">
            Apply for teacher access to create classes and quizzes
          </p>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Application</CardTitle>
            <CardDescription>
              Fill out this form to request teacher access. An admin will review your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institution" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Institution / Organization
                </Label>
                <Input
                  id="institution"
                  placeholder="e.g., Harvard University, ABC High School"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Why do you need teacher access?
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Explain how you plan to use the platform..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Applications are typically reviewed within 24-48 hours.
        </p>
      </div>
    </div>
  )
}
