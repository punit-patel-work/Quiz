"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { 
  Users, GraduationCap, BookOpen, FileText,
  Clock, Loader2, ArrowRight, UserCheck, AlertCircle,
  TrendingUp, TrendingDown, Activity, Eye
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.status === 401) { router.push("/login"); return }
      if (res.status === 403) {
        toast({ variant: "destructive", title: "Access Denied", description: "You don't have admin privileges" })
        router.push("/dashboard")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Donut chart for user distribution
  const UserDistChart = useMemo(() => {
    if (!stats) return null
    const total = stats.stats.totalUsers || 1
    const students = stats.stats.totalStudents || 0
    const teachers = stats.stats.totalTeachers || 0
    const admins = stats.stats.totalAdmins || 0
    const studentPct = Math.round((students / total) * 100)
    const teacherPct = Math.round((teachers / total) * 100)
    const adminPct = 100 - studentPct - teacherPct

    const studentAngle = (students / total) * 360
    const teacherAngle = (teachers / total) * 360

    // Create SVG arc paths for donut chart
    const createArc = (startAngle: number, endAngle: number) => {
      const r = 70
      const cx = 90, cy = 90
      const start = ((startAngle - 90) * Math.PI) / 180
      const end = ((endAngle - 90) * Math.PI) / 180
      const x1 = cx + r * Math.cos(start)
      const y1 = cy + r * Math.sin(start)
      const x2 = cx + r * Math.cos(end)
      const y2 = cy + r * Math.sin(end)
      const largeArc = endAngle - startAngle > 180 ? 1 : 0
      return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
    }

    return (
      <div className="flex flex-col items-center gap-4">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Student arc */}
          <path 
            d={createArc(0, Math.max(studentAngle, 1))} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="20" 
            strokeLinecap="round"
          />
          {/* Teacher arc */}
          <path 
            d={createArc(studentAngle, Math.max(studentAngle + teacherAngle, studentAngle + 1))} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="20" 
            strokeLinecap="round"
          />
          {/* Admin arc */}
          {admins > 0 && (
            <path 
              d={createArc(studentAngle + teacherAngle, 359.9)} 
              fill="none" 
              stroke="#8b5cf6" 
              strokeWidth="20" 
              strokeLinecap="round"
            />
          )}
          {/* Center text */}
          <text x="90" y="82" textAnchor="middle" className="fill-muted-foreground text-[11px]">Users</text>
          <text x="90" y="102" textAnchor="middle" className="fill-foreground text-2xl font-bold">{total}</text>
        </svg>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Students {studentPct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Teachers {teacherPct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-muted-foreground">Admin {adminPct}%</span>
          </div>
        </div>
      </div>
    )
  }, [stats])

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statCards = [
    {
      label: "TOTAL USERS",
      value: stats?.stats.totalUsers || 0,
      Icon: Users,
      gradient: "from-blue-500/10 to-cyan-500/10",
      border: "border-blue-200 dark:border-blue-800/50",
      iconColor: "text-blue-600",
      badgeBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    },
    {
      label: "TEACHERS",
      value: stats?.stats.totalTeachers || 0,
      Icon: GraduationCap,
      gradient: "from-emerald-500/10 to-teal-500/10",
      border: "border-emerald-200 dark:border-emerald-800/50",
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "CLASSES",
      value: stats?.stats.totalClasses || 0,
      Icon: BookOpen,
      gradient: "from-amber-500/10 to-orange-500/10",
      border: "border-amber-200 dark:border-amber-800/50",
      iconColor: "text-amber-600",
      badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    },
    {
      label: "QUIZZES",
      value: stats?.stats.totalQuizzes || 0,
      Icon: FileText,
      gradient: "from-violet-500/10 to-purple-500/10",
      border: "border-violet-200 dark:border-violet-800/50",
      iconColor: "text-violet-600",
      badgeBg: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300",
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Dashboard / Overview</p>
      </div>

      {/* Pending Applications Alert */}
      {stats?.stats.pendingApplications > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              {stats.stats.pendingApplications} pending teacher application(s) need your review
            </span>
          </div>
          <Button size="sm" asChild className="bg-yellow-600 hover:bg-yellow-700 text-white">
            <Link href="/admin/applications">
              Review Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className={`bg-gradient-to-br ${card.gradient} ${card.border} overflow-hidden relative`}>
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-1">{card.label}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.badgeBg}`}>
                  <card.Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle Row: Activity Section + User Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Platform Activity */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Platform Overview
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/logs">View Logs</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {/* Summary Cards inside */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-100 dark:border-blue-800/30">
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats?.stats.totalStudents || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-sm text-muted-foreground">Teachers</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats?.stats.totalTeachers || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30 border border-amber-100 dark:border-amber-800/30">
                <p className="text-sm text-muted-foreground">Classes</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats?.stats.totalClasses || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/50 dark:to-violet-900/30 border border-violet-100 dark:border-violet-800/30">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">{stats?.stats.pendingApplications || 0}</p>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/admin/users" 
                className="group flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:shadow-sm">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Manage Users</p>
                  <p className="text-xs text-muted-foreground truncate">{stats?.stats.totalUsers || 0} total users</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin/classes" 
                className="group flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:shadow-sm">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Manage Classes</p>
                  <p className="text-xs text-muted-foreground truncate">{stats?.stats.totalClasses || 0} active classes</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin/quizzes" 
                className="group flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:shadow-sm">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50 group-hover:scale-110 transition-transform">
                  <FileText className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">View Quizzes</p>
                  <p className="text-xs text-muted-foreground truncate">{stats?.stats.totalQuizzes || 0} total quizzes</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution Donut Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-2">
            {UserDistChart}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Applications + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              Recent Applications
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/applications" className="text-primary">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentApplications?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentApplications.map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                        {(app.user.name || app.user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{app.user.name || app.user.email}</p>
                        <p className="text-xs text-muted-foreground">{app.institution}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/admin/applications">Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No pending applications</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Recent Admin Activity
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/logs" className="text-primary">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentLogs?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentLogs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          <span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded mr-2">
                            {log.action}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {log.admin.name || log.admin.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
