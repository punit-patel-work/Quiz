"use client"

import { motion } from "framer-motion"
import { Users, Layout, CheckCircle, LineChart } from "lucide-react"

export function AnimatedStats() {
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
  )
}
