"use client"

import { useEffect } from "react"
import { Clock, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useQuizStore } from "@/lib/store"

export function Timer() {
  const { timeRemaining, isQuizActive } = useQuizStore()

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const isLowTime = timeRemaining <= 60 // Less than 1 minute

  return (
    <Card className={`${isLowTime ? 'border-destructive' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLowTime ? (
              <AlertCircle className="h-6 w-6 text-destructive animate-pulse" />
            ) : (
              <Clock className="h-6 w-6 text-primary" />
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time Remaining</p>
              <p className={`text-2xl font-bold ${isLowTime ? 'text-destructive' : ''}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
          {isLowTime && (
            <div className="text-right">
              <p className="text-sm font-medium text-destructive">Hurry up!</p>
              <p className="text-xs text-muted-foreground">Time is running out</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
