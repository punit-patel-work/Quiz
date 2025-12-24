"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, User as UserIcon, Calendar, Mail, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"

interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string
    emailVerified: Date | null
    createdAt: Date
  }
  stats: {
    totalQuizzesTaken: number
    totalQuizzesSaved: number
    averageScore: number
    bestScore: number
    lastQuizDate: Date | null
  }
}

export function ProfileForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [name, setName] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setName(data.user.name || "")
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name cannot be empty",
      })
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (res.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
        fetchProfile() // Refresh data
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to update")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={100}
              />
              <Button
                onClick={handleSave}
                disabled={isSaving || name === (profile.user.name || "")}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {name.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="flex items-center gap-2">
              <Input
                value={profile.user.email}
                disabled
                className="bg-muted"
              />
              {profile.user.emailVerified ? (
                <div className="flex items-center gap-1 text-green-600 text-sm whitespace-nowrap">
                  <CheckCircle className="h-4 w-4" />
                  <span>Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-600 text-sm whitespace-nowrap">
                  <XCircle className="h-4 w-4" />
                  <span>Not Verified</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Details about your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {profile.user.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(profile.user.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email Status</p>
                <p className="text-xs text-muted-foreground">
                  {profile.user.emailVerified ? "Verified" : "Pending verification"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Statistics</CardTitle>
          <CardDescription>
            Your quiz performance overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <div className="text-2xl font-bold text-primary">
                {profile.stats.totalQuizzesTaken}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Quizzes Taken
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-blue-500/10">
              <div className="text-2xl font-bold text-blue-600">
                {profile.stats.totalQuizzesSaved}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Quizzes Saved
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-green-500/10">
              <div className="text-2xl font-bold text-green-600">
                {profile.stats.averageScore.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Average Score
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-yellow-500/10">
              <div className="text-2xl font-bold text-yellow-600">
                {profile.stats.bestScore.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Best Score
              </div>
            </div>
          </div>

          {profile.stats.lastQuizDate && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                Last quiz taken on{" "}
                <span className="font-medium text-foreground">
                  {format(new Date(profile.stats.lastQuizDate), "MMM dd, yyyy 'at' h:mm a")}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
