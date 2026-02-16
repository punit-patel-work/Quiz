"use client"

import { useSession } from "next-auth/react"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const userRole = session?.user?.role || "student"
  const isTeacher = userRole === "teacher" || userRole === "admin"

  if (isTeacher) {
    return <TeacherDashboard />
  }

  return <StudentDashboard />
}
