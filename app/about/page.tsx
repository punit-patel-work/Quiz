import Link from "next/link"
import { ArrowLeft, Info, Github, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 md:py-24 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Info className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">About QuizFlow</h1>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <p className="text-xl text-muted-foreground leading-relaxed">
              QuizFlow is a modern, open-source educational platform designed to make creating, distributing, and grading quizzes as seamless as possible for teachers and students.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8 py-8">
            <div className="bg-muted/50 p-6 rounded-2xl border space-y-3">
              <Sparkles className="h-6 w-6 text-primary mb-2" />
              <h3 className="text-xl font-bold m-0">Our Mission</h3>
              <p className="text-muted-foreground">
                To provide high-quality, accessible software tools for education. We believe that powerful classroom management and assessment tools shouldn't be locked behind expensive enterprise paywalls.
              </p>
            </div>
            <div className="bg-muted/50 p-6 rounded-2xl border space-y-3">
              <Github className="h-6 w-6 text-foreground mb-2" />
              <h3 className="text-xl font-bold m-0">Open Source</h3>
              <p className="text-muted-foreground">
                QuizFlow is built on top of robust open-source technologies including Next.js, React, Tailwind CSS, and Prisma. We believe in building in public and contributing back to the community.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Key Features</h2>
            <ul className="grid md:grid-cols-2 gap-4 list-none pl-0">
              <li className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                Rapid JSON Quiz Uploads
              </li>
              <li className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                Manual Grading for Essay Questions
              </li>
              <li className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                Classroom Roster Management
              </li>
              <li className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                Instant Analytics & Feedback
              </li>
            </ul>
          </section>

          <div className="pt-8 border-t flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/register">Start Using QuizFlow Today</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
