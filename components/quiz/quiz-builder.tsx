"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { QuestionEditor } from "./question-editor"
import { generateId } from "@/lib/utils/id"

interface QuizBuilderProps {
  questions: any[]
  setQuestions: (questions: any[]) => void
}

export function QuizBuilder({ questions, setQuestions }: QuizBuilderProps) {
  
  const addQuestion = () => {
    const newQuestion = {
      id: generateId(),
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: ""
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, updated: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = updated
    setQuestions(newQuestions)
  }

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuestionEditor
            key={q.id || i}
            index={i}
            question={q}
            onChange={(updated) => updateQuestion(i, updated)}
            onRemove={() => removeQuestion(i)}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Button onClick={addQuestion} variant="outline" className="w-full md:w-auto min-w-[200px] border-dashed">
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>
      
      {questions.length === 0 && (
        <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
          <p>No questions yet. Click above to start adding questions.</p>
        </div>
      )}
    </div>
  )
}
