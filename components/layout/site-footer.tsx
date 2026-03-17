import Link from "next/link"
import { Github, Twitter, Mail } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/logo.svg" alt="QuizFlow Logo" className="w-8 h-8" />
              <span className="font-bold text-xl">QuizFlow</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              The modern open-source platform for teachers and students to create, distribute, and grade educational quizzes. 
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="mailto:hello@quizflow.example.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm tracking-tight">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/setup" className="text-muted-foreground hover:text-foreground transition-colors">
                  Start a Quiz
                </Link>
              </li>
              <li>
                <a href="/Class_Quiz_Template.json" download className="text-muted-foreground hover:text-foreground transition-colors">
                  Download JSON Template
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm tracking-tight">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} QuizFlow. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <span className="text-red-500">♥</span> for education.
          </p>
        </div>
      </div>
    </footer>
  )
}
