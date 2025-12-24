"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { 
  Shield, 
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Globe
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { format } from "date-fns"

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [newNote, setNewNote] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      fetchDomains()
    }
  }, [status])

  const fetchDomains = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/approved-domains")
      if (res.status === 403) {
        router.push("/dashboard")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setDomains(data)
      }
    } catch (error) {
      console.error("Failed to fetch domains:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newDomain.trim()) {
      toast({
        variant: "destructive",
        title: "Domain is required",
      })
      return
    }

    setIsAdding(true)
    try {
      const res = await fetch("/api/admin/approved-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain, note: newNote }),
      })

      if (res.ok) {
        toast({ title: "Domain added successfully" })
        setAddDialogOpen(false)
        setNewDomain("")
        setNewNote("")
        fetchDomains()
      } else {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add domain",
        description: error.message,
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this domain?")) return

    try {
      const res = await fetch(`/api/admin/approved-domains/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({ title: "Domain removed" })
        fetchDomains()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to remove domain",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="h-8 w-8" />
                Approved Domains
              </h1>
              <p className="text-muted-foreground">
                Manage email domains for automatic teacher approval
              </p>
            </div>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Approved Domain</DialogTitle>
                <DialogDescription>
                  Users with emails from this domain will be automatically approved as teachers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    placeholder="@university.edu"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include the @ symbol (e.g., @harvard.edu)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Input
                    id="note"
                    placeholder="e.g., Harvard University faculty emails"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={isAdding}>
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Domain"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>How it works:</strong> When a user applies to become a teacher, the system 
              checks if their email domain is in this list. If it matches, they are 
              automatically approved without admin review.
            </p>
          </CardContent>
        </Card>

        {/* Domains List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : domains.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No approved domains</h3>
              <p className="text-muted-foreground mb-4">
                Add domains to enable automatic teacher approval
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Domain
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono font-medium">{domain.domain}</p>
                        {domain.note && (
                          <p className="text-sm text-muted-foreground">{domain.note}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Added {format(new Date(domain.addedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      onClick={() => handleDelete(domain.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
