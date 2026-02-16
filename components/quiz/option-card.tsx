"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Check, Circle } from "lucide-react"

interface OptionCardProps {
  label: string
  content: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
  index: number
}

export function OptionCard({ 
  label, 
  content, 
  isSelected, 
  onClick, 
  disabled,
  index 
}: OptionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group overflow-hidden",
        "hover:border-primary/50 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected 
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-muted bg-card",
        disabled && "opacity-50 cursor-not-allowed hover:border-muted hover:bg-card"
      )}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
    >
      <div className="flex items-center gap-4">
        {/* Key/Index Box */}
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
          isSelected 
            ? "border-primary bg-primary text-primary-foreground" 
            : "border-muted bg-muted text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
        )}>
          {label}
        </div>

        {/* Content */}
        <div className="flex-1 text-base font-medium leading-none">
          {content}
        </div>

        {/* Checkbox Icon */}
        <div className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
          isSelected 
            ? "border-primary bg-primary text-primary-foreground" 
            : "border-muted-foreground/30 text-transparent"
        )}>
          <Check className="h-4 w-4" />
        </div>
      </div>
      
      {/* Selection Glow Effect */}
      {isSelected && (
        <motion.div
          layoutId="outline"
          className="absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background z-[-1]"
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  )
}
