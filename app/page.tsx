import Link from "next/link"
import { 
  ArrowRight, 
  Brain, 
  Download, 
  Layout, 
  LineChart,
  Users,
  Sparkles, 
  BookOpen,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedHero } from "@/components/marketing/animated-hero"
import { AnimatedStats } from "@/components/marketing/animated-stats"
import { AnimatedFeatures } from "@/components/marketing/animated-features"
import { CopyPromptButton } from "@/components/marketing/copy-prompt-button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* Hero Section */}
      <AnimatedHero />

      {/* Stats Section */}
      <AnimatedStats />

      {/* How It Works Section */}
      <AnimatedFeatures />

      {/* Features Grid */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Everything You Need to Quiz</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple, powerful tools for students and teachers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-card to-muted border-none shadow-md hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-8 px-6 pb-8 space-y-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Layout className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Instant JSON Quizzes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No complex setup. Just fill out our simple JSON template with your questions and upload to start quizzing immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-muted border-none shadow-md hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-8 px-6 pb-8 space-y-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <LineChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Detailed Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track your progress with comprehensive reports. See your scores, time taken, and improvements over multiple attempts.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-muted border-none shadow-md hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-8 px-6 pb-8 space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Classrooms for Teachers</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Teachers can create classes, invite students, manage manual quizzes, and track student performance in real-time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Prompts Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
             <Badge variant="outline" className="px-4 py-1.5 rounded-full text-sm border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
              AI Workflow
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold">Turn Any Topic into a Quiz</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload our blank JSON template to ChatGPT or Claude, then use these prompts to generate a full quiz on your chosen subject.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-background border-dashed border-2 shadow-sm">
              <CardContent className="pt-8 px-6 pb-8 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                     <Brain className="h-5 w-5" />
                   </div>
                   <h3 className="font-semibold text-lg">Create New Quiz</h3>
                </div>
                <div className="bg-muted p-4 rounded-xl font-mono text-sm leading-relaxed overflow-x-auto">
                  "I have uploaded a JSON template. Please generate a quiz about <strong>[INSERT TOPIC HERE]</strong> with 10 questions. Populate the JSON fields with the content, keeping the exact same structure."
                </div>
                <CopyPromptButton prompt="I have uploaded a JSON template. Please generate a quiz about [INSERT TOPIC HERE] with 10 questions. Populate the JSON fields with the content, keeping the exact same structure." />
              </CardContent>
            </Card>

            <Card className="bg-background border-dashed border-2 shadow-sm">
              <CardContent className="pt-8 px-6 pb-8 space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                     <Layout className="h-5 w-5" />
                   </div>
                   <h3 className="font-semibold text-lg">Convert Notes to Quiz</h3>
                </div>
                <div className="bg-muted p-4 rounded-xl font-mono text-sm leading-relaxed overflow-x-auto">
                  "I have uploaded a JSON template and my study notes. Create a 15-question quiz based on the notes, filling into the JSON template format exactly."
                </div>
                <CopyPromptButton prompt="I have uploaded a JSON template and my study notes. Create a 15-question quiz based on the notes, filling into the JSON template format exactly." />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Start Quizzing Today</h2>
          <p className="text-primary-foreground/80 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of students and teachers using our platform. Free and open source.
          </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full shadow-lg">
              <a href="/Quiz_Template.json" download="Quiz_Template.json">
                 <Download className="mr-2 h-5 w-5" />
                 Personal Quiz Template
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full shadow-lg">
              <a href="/Class_Quiz_Template.json" download="Class_Quiz_Template.json">
                 <FileText className="mr-2 h-5 w-5" />
                 Class Quiz Template
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/register">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}

