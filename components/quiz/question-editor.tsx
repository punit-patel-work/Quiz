"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Check, X } from "lucide-react"

interface Question {
  id: string
  type: "multiple-choice" | "true-false" | "fill-in-blank"
  question: string
  options?: string[]
  correctAnswer: string | boolean
}

interface QuestionEditorProps {
  question: Question
  index: number
  onChange: (updated: Question) => void
  onRemove: () => void
}

export function QuestionEditor({ question, index, onChange, onRemove }: QuestionEditorProps) {
  const handleTypeChange = (type: "multiple-choice" | "true-false" | "fill-in-blank") => {
    let newQuestion = { ...question, type }
    
    // Reset options/answer based on type
    if (type === "true-false") {
      newQuestion.options = ["True", "False"]
      newQuestion.correctAnswer = "True" // Default string for storage simplicity, though logic might use boolean
    } else if (type === "fill-in-blank") {
      newQuestion.options = []
      newQuestion.correctAnswer = ""
    } else {
      newQuestion.options = ["", "", "", ""]
      newQuestion.correctAnswer = ""
    }
    
    onChange(newQuestion)
  }

  const updateOption = (optIndex: number, value: string) => {
    if (!question.options) return
    const newOptions = [...question.options]
    newOptions[optIndex] = value
    onChange({ ...question, options: newOptions })
  }

  const addOption = () => {
    if (!question.options) return
    onChange({ ...question, options: [...question.options, ""] })
  }

  const removeOption = (optIndex: number) => {
    if (!question.options) return
    const newOptions = question.options.filter((_, i) => i !== optIndex)
    onChange({ ...question, options: newOptions })
  }

  return (
    <Card className="relative group">
      <CardContent className="pt-6 space-y-4">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive/90">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Label>Question Text</Label>
                <Textarea 
                  value={question.question}
                  onChange={(e) => onChange({ ...question, question: e.target.value })}
                  placeholder="Enter your question here..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={question.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True / False</SelectItem>
                    <SelectItem value="fill-in-blank">Fill in Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Options Editor */}
            <div className="space-y-3">
               <Label>Answer Options</Label>
               
               {question.type === "multiple-choice" && (
                 <div className="space-y-2">
                   {question.options?.map((opt, i) => (
                     <div key={i} className="flex items-center gap-2">
                       <div className="cursor-pointer" onClick={() => onChange({ ...question, correctAnswer: opt })}>
                         {question.correctAnswer === opt && opt !== "" ? (
                           <Check className="h-4 w-4 text-green-600" />
                         ) : (
                           <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                         )}
                       </div>
                       <Input 
                         value={opt} 
                         onChange={(e) => updateOption(i, e.target.value)}
                         placeholder={`Option ${i + 1}`}
                       />
                       <Button variant="ghost" size="icon" onClick={() => removeOption(i)} disabled={question.options!.length <= 2}>
                          <X className="h-4 w-4" />
                       </Button>
                     </div>
                   ))}
                   <Button variant="outline" size="sm" onClick={addOption} className="mt-2">
                     <Plus className="h-3 w-3 mr-2" /> Add Option
                   </Button>
                   <p className="text-xs text-muted-foreground mt-1">Click the circle to mark the correct answer.</p>
                 </div>
               )}

               {question.type === "true-false" && (
                 <div className="flex gap-4">
                    {["True", "False"].map((opt) => (
                      <div 
                        key={opt}
                        onClick={() => onChange({ ...question, correctAnswer: opt })}
                        className={`
                          flex-1 p-3 rounded-lg border-2 cursor-pointer text-center font-medium transition-colors
                          ${question.correctAnswer === opt 
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" 
                            : "border-muted hover:border-muted-foreground/50"}
                        `}
                      >
                        {opt}
                      </div>
                    ))}
                 </div>
               )}

               {question.type === "fill-in-blank" && (
                 <div className="space-y-2">
                   <Label className="text-xs text-muted-foreground">Correct Answer (text match)</Label>
                   <Input 
                     value={question.correctAnswer as string}
                     onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
                     placeholder="Type the exact answer..."
                   />
                   <p className="text-xs text-muted-foreground">The student's answer must match this exactly (case insensitive).</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
