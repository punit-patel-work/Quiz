import { motion, AnimatePresence } from "framer-motion"
import { OptionCard } from "./option-card"
import { Question } from "@/lib/quiz-validator"

interface QuestionRendererProps {
  question: Question
  answer: string | boolean | null
  onAnswerChange: (answer: string | boolean) => void
}

export function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  // Generate labels (A, B, C, D...)
  const getLabel = (index: number) => String.fromCharCode(65 + index)

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Question Text */}
          <h2 className="text-2xl md:text-3xl font-bold leading-tight text-foreground">
            {question.question}
          </h2>

          {/* Options Grid for MCQ and True/False */}
          {(question.type === "multiple_choice" || question.type === "true_false") && (
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
              {(question.type === "true_false" ? ["True", "False"] : question.options || []).map((option, index) => (
                <OptionCard
                  key={`${question.id}-${index}`}
                  index={index}
                  label={getLabel(index)}
                  content={option}
                  isSelected={answer === option}
                  onClick={() => onAnswerChange(option)}
                />
              ))}
            </div>
          )}

          {/* Input for Fill in the Blank */}
          {question.type === "fill_in_the_blank" && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={(answer as string) || ""}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4  text-lg bg-background border-2 border-muted rounded-xl focus:border-primary focus:outline-none transition-colors"
                  autoFocus
                />
                <div className="absolute inset-0 rounded-xl pointer-events-none ring-offset-2 peer-focus:ring-2 peer-focus:ring-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Press Enter to submit (if last question) or Arrow Right to skip.
              </p>
            </div>
          )}

          {/* Textarea for Descriptive / Long Answer */}
          {question.type === "descriptive" && (
            <div className="space-y-4">
              <textarea
                value={(answer as string) || ""}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Write your detailed answer here..."
                rows={8}
                className="w-full p-4 text-lg bg-background border-2 border-muted rounded-xl focus:border-primary focus:outline-none transition-colors resize-y min-h-[200px]"
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                This is a descriptive question. Your answer will be reviewed and graded by your teacher.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
