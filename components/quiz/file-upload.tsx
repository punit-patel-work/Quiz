"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileJson, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { validateQuizJSON } from "@/lib/quiz-validator"
import { QuizNameDialog } from "./quiz-name-dialog"

interface FileUploadProps {
  onQuizSaved: (quizId: string, quizName: string, data: any) => void
}

export function FileUpload({ onQuizSaved }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [quizData, setQuizData] = useState<any>(null)
  const [isValidated, setIsValidated] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setIsValidated(false)
      setQuizData(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
  })

  const validateFile = async () => {
    if (!file) return

    setIsValidating(true)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const validation = validateQuizJSON(data)

      if (validation.success) {
        setIsValidated(true)
        setQuizData(validation.data)
        setShowNameDialog(true) // Show name dialog after validation
        toast({
          title: "Quiz Validated!",
          description: `${validation.data?.length || 0} questions found.`,
        })
      } else {
        setIsValidated(false)
        toast({
          variant: "destructive",
          title: "Validation Failed",
          description: "The uploaded file does not match the required quiz format.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: "Unable to parse the uploaded file. Please check the format.",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleQuizNamed = async (name: string) => {
    if (!quizData) return

    setIsSaving(true)

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          questions: quizData,
        }),
      })

      if (res.ok) {
        const savedQuiz = await res.json()
        toast({
          title: "Quiz Saved!",
          description: `"${name}" has been added to your library.`,
        })
        onQuizSaved(savedQuiz.id, name, quizData)
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save quiz. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setIsValidated(false)
    setQuizData(null)
  }

  return (
    <>
      <div className="space-y-4">
        {!file ? (
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">
                  {isDragActive ? "Drop the file here" : "Upload Quiz JSON"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your quiz file, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Only .json files are accepted
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <FileJson className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    {isValidated && (
                      <div className="flex items-center gap-2 mt-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Validated Successfully</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {!isValidated && (
                <Button
                  onClick={validateFile}
                  disabled={isValidating || isSaving}
                  className="w-full mt-4"
                >
                  {isValidating ? "Validating..." : "Check Format"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <QuizNameDialog
        open={showNameDialog}
        onOpenChange={setShowNameDialog}
        onConfirm={handleQuizNamed}
        questionCount={quizData?.length || 0}
      />
    </>
  )
}
