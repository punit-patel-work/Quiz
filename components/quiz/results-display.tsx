"use client"

import { CheckCircle, XCircle, Trophy, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Question } from "@/lib/quiz-validator"
import { UserAnswer, getGrade } from "@/lib/scoring"

interface ResultsDisplayProps {
  score: number
  totalQuestions: number
  percentage: number
  results: UserAnswer[]
  questions: Question[]
}

export function ResultsDisplay({
  score,
  totalQuestions,
  percentage,
  results,
  questions,
}: ResultsDisplayProps) {
  const grade = getGrade(percentage)

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
          <CardDescription>Here's how you performed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold text-primary">
              {score}/{totalQuestions}
            </div>
            <div className="text-2xl font-semibold">
              {percentage.toFixed(1)}% - Grade: {grade}
            </div>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">
                {totalQuestions - score}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question-by-Question Review */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Detailed Review
        </h2>
        {questions.map((question, index) => {
          const result = results.find((r) => r.questionId === question.id)
          const isCorrect = result?.isCorrect || false

          let correctAnswerText: string
          if (typeof question.correct_answer === 'boolean') {
            correctAnswerText = question.correct_answer ? 'True' : 'False'
          } else if (Array.isArray(question.correct_answer)) {
            correctAnswerText = question.correct_answer.join(' / ')
          } else {
            correctAnswerText = question.correct_answer
          }

          let userAnswerText = result?.userAnswer !== null && result?.userAnswer !== undefined
            ? String(result.userAnswer)
            : 'Not answered'

          if (typeof result?.userAnswer === 'boolean') {
            userAnswerText = result.userAnswer ? 'True' : 'False'
          }

          return (
            <Card
              key={question.id}
              className={`border-l-4 ${
                isCorrect ? "border-l-green-500" : "border-l-destructive"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="text-sm font-medium">
                        Question {question.id}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {question.topic}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{question.question}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium min-w-24">Your answer:</span>
                    <span className={`text-sm ${isCorrect ? 'text-green-600 font-medium' : 'text-destructive'}`}>
                      {userAnswerText}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium min-w-24">Correct answer:</span>
                      <span className="text-sm text-green-600 font-medium">
                        {correctAnswerText}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Explanation:</p>
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
