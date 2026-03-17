import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 md:py-24 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
            <p>
              By accessing and using QuizFlow, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. Use License</h2>
            <p>
              QuizFlow is provided as an open-source educational tool. You are granted permission to use the platform for creating and taking educational quizzes. You agree not to use the platform for any illegal or unauthorized purpose.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. User Conduct</h2>
            <p>As a user of this platform, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information when creating an account.</li>
              <li>Maintain the security of your account credentials.</li>
              <li>Not upload content that is malicious, offensive, or violates intellectual property rights.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. Disclaimer</h2>
            <p>
              The materials on QuizFlow are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">5. Limitations</h2>
            <p>
              In no event shall QuizFlow or its contributors be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the platform.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
