import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 md:py-24 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            <p>
              QuizFlow is designed with privacy in mind. We collect only the minimum amount of information necessary to provide our educational services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> If you create an account, we collect your name and email address for authentication and platform access.</li>
              <li><strong>Educational Data:</strong> We store quizzes created by teachers, and the answers/scores submitted by students, solely for the purpose of running the classes and providing grades.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
            <p>We use the information we collect strictly for operating the QuizFlow platform:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To allow teachers to manage classes and students to take quizzes.</li>
              <li>To notify users of quiz invitations and grade postings.</li>
              <li>To improve the technical performance and stability of our open-source software.</li>
            </ul>
            <p className="font-semibold text-primary">We do not sell, rent, or share your personal data with third-party marketers.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. All communication between your browser and our servers is encrypted using HTTPS. Database access is strictly secured and monitored.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. Your Rights</h2>
            <p>
              Users have the right to request access to, correction of, or deletion of their personal data. Teachers can delete their classes (which cascades to all corresponding student data) directly from the application dashboard at any time.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
