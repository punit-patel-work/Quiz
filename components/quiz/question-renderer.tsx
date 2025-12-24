"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Question } from "@/lib/quiz-validator"

interface QuestionRendererProps {
  question: Question
  answer: string | boolean | null
  onAnswerChange: (answer: string | boolean) => void
}

export function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  const renderQuestionContent = () => {
    switch (question.type) {
      case "multiple_choice":
        return (
          <RadioGroup
            value={answer as string || ""}
            onValueChange={(value) => onAnswerChange(value)}
          >
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer"
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )

      case "true_false":
        return (
          <div className="space-y-3">
            <Button
              type="button"
              variant={answer === true ? "default" : "outline"}
              className="w-full justify-start h-auto p-4"
              onClick={() => onAnswerChange(true)}
            >
              <span className="text-lg">True</span>
            </Button>
            <Button
              type="button"
              variant={answer === false ? "default" : "outline"}
              className="w-full justify-start h-auto p-4"
              onClick={() => onAnswerChange(false)}
            >
              <span className="text-lg">False</span>
            </Button>
          </div>
        )

      case "fill_in_the_blank":
        return (
          <div className="space-y-2">
            <Label htmlFor="answer">Your Answer</Label>
            <Input
              id="answer"
              type="text"
              placeholder="Type your answer here..."
              value={answer as string || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="text-lg p-6"
            />
            <p className="text-sm text-muted-foreground">
              Answer is case-insensitive
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            {question.topic}
          </span>
          <span className="text-sm text-muted-foreground">
            Question {question.id}
          </span>
        </div>
        <CardTitle className="text-xl">{question.question}</CardTitle>
        <CardDescription className="capitalize">
          {question.type.replace("_", " ")}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderQuestionContent()}</CardContent>
    </Card>
  )
}
