"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { QuestionRenderer } from "@/components/quiz/question-renderer"
import { Timer } from "@/components/quiz/timer"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight, Send, Maximize2, Minimize2, ArrowLeft, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function TeacherQuizPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const classId = params.id as string
  const quizId = params.quizId as string

  const [quizData, setQuizData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<number, string | boolean>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [zenMode, setZenMode] = useState(false)

  // Fetch quiz data (teacher perspective)
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/classes/${classId}/quizzes/${quizId}`)
        if (res.ok) {
          const data = await res.json()
          setQuizData(data)
          setTimeRemaining(data.duration * 60)
        } else {
          toast({ variant: "destructive", title: "Error", description: "Failed to load quiz for preview" })
          router.push(`/classes/${classId}`)
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load quiz" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuiz()
  }, [classId, quizId])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining])

  const handleAnswerChange = (answer: string | boolean) => {
    setUserAnswers(prev => {
      const newAnswers = new Map(prev)
      if (quizData && quizData.questions[currentQuestionIndex]) {
        newAnswers.set(quizData.questions[currentQuestionIndex].id, answer)
      }
      return newAnswers
    })
  }

  const handleSubmit = useCallback(() => {
    toast({
      title: "Preview Submitted",
      description: "In a real attempt, this would save the student's answers and calculate their score.",
    })
    router.push(`/classes/${classId}`)
  }, [classId, router, toast])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleZenMode = () => {
    setZenMode(!zenMode)
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e))
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!quizData) return;
        if (e.key === "ArrowRight" && currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1)
        } else if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
            setCurrentQuestionIndex(i => i - 1)
        } else if (e.key === "Enter" && e.metaKey) { // Cmd+Enter
            handleSubmit()
        }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentQuestionIndex, quizData, handleSubmit])


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quizData) return null

  const currentQuestion = quizData.questions[currentQuestionIndex]
  const currentAnswer = userAnswers.get(currentQuestion?.id)
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100
  const isRedTime = timeRemaining <= 60 && timeRemaining > 0
  const isAmberTime = timeRemaining <= 300 && timeRemaining > 60

  return (
    <div className={`min-h-screen transition-colors duration-500 ${zenMode ? 'bg-background fixed inset-0 z-50 overflow-y-auto' : 'bg-muted/30'}`}>
       
       {/* Preview Banner */}
       {!zenMode && (
         <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
           <Eye className="h-4 w-4" />
           Teacher Preview Mode - Results will not be saved
           <Button variant="link" className="text-amber-800 dark:text-amber-400 underline h-auto p-0 ml-4" asChild>
             <Link href={`/classes/${classId}`}>Exit Preview</Link>
           </Button>
         </div>
       )}

       {/* Top Bar */}
       <header className={`sticky top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b ${zenMode ? 'px-8' : ''}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg truncate max-w-[200px] sm:max-w-md">
              {quizData.name}
            </h1>
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {currentQuestionIndex + 1} / {quizData.questions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono font-medium transition-colors ${
              isRedTime ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse" : 
              isAmberTime ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : 
              "bg-muted"
            }`}>
              <div className="h-4 w-4"> {/* Clock icon placeholder just text here for simplicity inside timer component usually */}
                🕒
              </div>
              {formatTime(timeRemaining)}
            </div>
            
            <Button variant="ghost" size="icon" onClick={toggleZenMode} title="Toggle Zen Mode">
              {zenMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Progress Line */}
        <motion.div 
          className="h-1 bg-primary origin-left" 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
      </header>

      {/* Main Content */}
      <main className={`container mx-auto px-4 py-12 md:py-20 max-w-3xl ${zenMode ? 'max-w-4xl' : ''}`}>
        <div className="space-y-12">
          {currentQuestion && (
             <QuestionRenderer
               question={currentQuestion}
               answer={currentAnswer ?? null}
               onAnswerChange={handleAnswerChange}
             />
          )}

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
              disabled={currentQuestionIndex === 0}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            <div className="hidden md:flex gap-1.5 items-center">
                {quizData.questions.map((_: any, i: number) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentQuestionIndex(i)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                            currentQuestionIndex === i 
                                ? 'bg-primary text-primary-foreground shadow-md' 
                                : userAnswers.has(quizData.questions[i].id)
                                    ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                    : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                        {i + 1}
                    </motion.button>
                ))}
            </div>

            {currentQuestionIndex === quizData.questions.length - 1 ? (
              <Button
                size="lg"
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Preview
                <Send className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setCurrentQuestionIndex(i => Math.min(quizData.questions.length - 1, i + 1))}
                className="w-full sm:w-auto"
              >
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
