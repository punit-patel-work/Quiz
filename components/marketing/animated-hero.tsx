"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Download, Layout, Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function AnimatedHero() {
  return (
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
  )
}
