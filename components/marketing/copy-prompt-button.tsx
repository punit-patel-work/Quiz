"use client"

import { Button } from "@/components/ui/button"

export function CopyPromptButton({ prompt }: { prompt: string }) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="w-full mt-2" 
      onClick={() => {
        navigator.clipboard.writeText(prompt)
      }}
    >
      Copy Prompt
    </Button>
  )
}
