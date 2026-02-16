"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { 
  BookOpen, 
  Users, 
  Clock, 
  AlertCircle,
  Loader2,
  ArrowRight,
  GraduationCap
} from "lucide-react"

export default function MyClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/my-classes")
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error)
    } finally {
      setIsLoading(false)
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8" />
            My Classes
          </h1>
          <p className="text-muted-foreground">
            Classes you've joined as a student
          </p>
        </div>

        {/* Classes */}
        {classes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't joined any classes yet. Check your invitations!
              </p>
              <Button asChild>
                <Link href="/invitations">Check Invitations</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="truncate">{cls.name}</CardTitle>
                  {cls.description && (
                    <CardDescription className="line-clamp-2">
                      {cls.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Teacher: {cls.teacher.name || cls.teacher.email}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{cls.memberCount} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{cls.totalQuizzes} quizzes</span>
                    </div>
                  </div>

                  {cls.pendingQuizzes > 0 && (
                    <div className="flex items-center gap-2 text-yellow-600 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span>{cls.pendingQuizzes} quiz(es) pending</span>
                    </div>
                  )}

                  <Button asChild className="w-full">
                    <Link href={`/my-classes/${cls.id}`}>
                      View Class
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
