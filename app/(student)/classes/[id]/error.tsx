"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react"
import Link from "next/link"

export default function ClassError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Class Route Error Caught:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-background rounded-xl shadow-lg border p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Class Not Found</h2>
          <p className="text-muted-foreground">
            We couldn't load this information. The class might have been deleted, or there is a temporary issue connecting to the database.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={reset} variant="default" className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Loading Again
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/classes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Classes
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
