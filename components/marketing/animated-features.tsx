"use client"

import { motion } from "framer-motion"
import { Users, FileText, PenLine, ClipboardCheck, BarChart3, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AnimatedFeatures() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
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
        </div>
      </section>
  )
}
