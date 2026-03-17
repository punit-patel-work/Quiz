"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowRight, 
  Brain, 
  CheckCircle, 
  Download, 
  Layout, 
  LineChart, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Zap,
  BookOpen,
  FileText,
  PenLine,
  ClipboardCheck,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 } as any
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[70%] bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply" />
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[60%] bg-blue-500/10 blur-[100px] rounded-full mix-blend-multiply" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <Badge variant="outline" className="px-4 py-1.5 rounded-full text-sm border-primary/20 bg-primary/5 text-primary backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
              New: Descriptive Questions with Teacher Grading
            </Badge>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            Upload, Quiz, Master <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-600 text-transparent bg-clip-text">
              Test Your Knowledge Instantly
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The easiest way to take quizzes. Download our JSON template, add your questions, and start testing yourself or your students in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all w-full sm:w-auto">
              <a href="/Quiz_Template.json" download="Quiz_Template.json">
                 <Download className="mr-2 h-5 w-5" />
                 Personal Quiz Template
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full w-full sm:w-auto">
              <a href="/Class_Quiz_Template.json" download="Class_Quiz_Template.json">
                 <FileText className="mr-2 h-5 w-5" />
                 Class Quiz Template
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full w-full sm:w-auto">
              <Link href="/setup">
                <Layout className="mr-2 h-5 w-5" />
                Start Quiz
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-12 border-y bg-muted/30"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Users", value: "10k+", icon: Users },
              { label: "Quizzes Created", value: "50k+", icon: Layout },
              { label: "Questions Answered", value: "1M+", icon: CheckCircle },
              { label: "Completion Rate", value: "94%", icon: LineChart },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="space-y-2">
                <stat.icon className="mx-auto h-8 w-8 text-primary/80 mb-2" />
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 space-y-3">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full text-sm border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400">
              <BookOpen className="w-3.5 h-3.5 mr-2 inline-block" />
              For Teachers & Schools
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold">How This Website Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              An online quiz and exam platform for teachers and schools. Create quizzes, assign them to classes, grade descriptive answers, and track results — all in one place.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="max-w-4xl mx-auto mt-16"
          >
            <div className="space-y-0">
              {[
                {
                  step: 1,
                  title: "Create a Class",
                  description: "Sign up as a teacher, create a class, and invite your students via email or a class code.",
                  icon: Users,
                  color: "blue",
                },
                {
                  step: 2,
                  title: "Create or Import a Quiz",
                  description: "Build quizzes manually with our question editor (MCQ, True/False, Fill-in-the-Blank, Descriptive) or upload a JSON file.",
                  icon: FileText,
                  color: "purple",
                },
                {
                  step: 3,
                  title: "Students Take the Quiz",
                  description: "Students join your class, take the quiz within the scheduled window, and submit their answers — including long-form descriptive responses.",
                  icon: PenLine,
                  color: "amber",
                },
                {
                  step: 4,
                  title: "Teacher Grades Descriptive Answers",
                  description: "Review each student's descriptive answers side-by-side with your model answer. Assign scores and provide feedback.",
                  icon: ClipboardCheck,
                  color: "green",
                },
                {
                  step: 5,
                  title: "Results Are Published",
                  description: "Once grading is complete, results are released automatically. Students see their scores, teacher feedback, and detailed breakdowns.",
                  icon: BarChart3,
                  color: "rose",
                },
              ].map((item, i) => (
                <motion.div key={i} variants={itemVariants} className="flex gap-6 items-start relative">
                  {/* Vertical connector line */}
                  {i < 4 && (
                    <div className="absolute left-6 top-14 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-muted-foreground/20 to-transparent" />
                  )}
                  {/* Step number circle */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg z-10
                    ${{blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
                       purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
                       amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                       green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
                       rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                    }[item.color]}
                  `}>
                    {item.step}
                  </div>
                  {/* Step content */}
                  <div className="pb-10">
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className={`h-5 w-5
                        ${{blue: "text-blue-600 dark:text-blue-400",
                           purple: "text-purple-600 dark:text-purple-400",
                           amber: "text-amber-600 dark:text-amber-400",
                           green: "text-green-600 dark:text-green-400",
                           rose: "text-rose-600 dark:text-rose-400"
                        }[item.color]}
                      `} />
                      <h3 className="text-xl font-bold">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <Button asChild size="lg" className="h-12 px-8 rounded-full shadow-lg">
              <Link href="/register">
                <ArrowRight className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-full">
              <a href="/Class_Quiz_Template.json" download="Class_Quiz_Template.json">
                <Download className="mr-2 h-5 w-5" />
                View Sample Quiz JSON
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-full">
              <Link href="/dashboard">
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

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
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => {
                  navigator.clipboard.writeText("I have uploaded a JSON template. Please generate a quiz about [INSERT TOPIC HERE] with 10 questions. Populate the JSON fields with the content, keeping the exact same structure.")
                }}>
                  Copy Prompt
                </Button>
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
                 <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => {
                  navigator.clipboard.writeText("I have uploaded a JSON template and my study notes. Create a 15-question quiz based on the notes, filling into the JSON template format exactly.")
                }}>
                  Copy Prompt
                </Button>
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

