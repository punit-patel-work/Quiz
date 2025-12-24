"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { validateQuizName } from "@/lib/quiz-storage"

interface QuizNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (name: string) => void
  questionCount: number
}

export function QuizNameDialog({ open, onOpenChange, onConfirm, questionCount }: QuizNameDialogProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleConfirm = () => {
    const validation = validateQuizName(name)
    if (!validation.valid) {
      setError(validation.error || "Invalid quiz name")
      return
    }

    onConfirm(name)
    setName("")
    setError("")
    onOpenChange(false)
  }

  const handleCancel = () => {
    setName("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Name Your Quiz</DialogTitle>
          <DialogDescription>
            You've uploaded a quiz with {questionCount} questions. Give it a name so you can easily find it later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-name">Quiz Name</Label>
            <Input
              id="quiz-name"
              placeholder="e.g., JavaScript Basics, History Test..."
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm()
                }
              }}
              maxLength={100}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {name.length}/100 characters
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Save Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
