"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Trash2, Clock, FileQuestion } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface QuizCardProps {
  id: string
  name: string
  description: string | null
  questionCount?: number
  attemptCount: number
  createdAt: string
  onDelete?: () => void
}

export function QuizCard({
  id,
  name,
  description,
  questionCount,
  attemptCount,
  createdAt,
  onDelete,
}: QuizCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleTakeQuiz = () => {
    router.push(`/setup?quizId=${id}`)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Quiz Deleted",
          description: "The quiz has been removed from your library.",
        })
        onDelete?.()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete quiz. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="truncate">{name}</span>
            <FileQuestion className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </CardTitle>
          {description && (
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileQuestion className="h-4 w-4" />
              <span>{questionCount || "—"} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{attemptCount} attempts</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Created {format(new Date(createdAt), "MMM dd, yyyy")}
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={handleTakeQuiz} className="flex-1">
            <Play className="mr-2 h-4 w-4" />
            Take Quiz
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{name}" and all associated quiz results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
