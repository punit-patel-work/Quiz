"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { 
  LayoutDashboard, BookOpen, Clock, Settings, 
  ChevronLeft, ChevronRight, Menu, X, PlusCircle,
  GraduationCap, Mail, Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const userRole = session?.user?.role || "student"
  const isTeacher = userRole === "teacher" || userRole === "admin"

  // Dynamic sidebar items based on role
  const finalSidebarItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    // For teachers, "My Classes" goes to their teaching page (/classes)
    // For students, "My Classes" goes to their enrolled page (/my-classes)
    { 
      href: isTeacher ? "/classes" : "/my-classes", 
      label: isTeacher ? "My Classes (Teaching)" : "My Classes", 
      icon: isTeacher ? Users : GraduationCap 
    },
    // If teacher, optionally show Enrolled Classes if they want to learn too
    ...(isTeacher ? [{ 
      href: "/my-classes", 
      label: "Enrolled Classes", 
      icon: GraduationCap 
    }] : []),
    { href: "/invitations", label: "Invitations", icon: Mail },
    { href: "/history", label: "History", icon: Clock },
    { href: "/setup", label: "New Quiz", icon: PlusCircle },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-16 left-0 z-50 h-[calc(100vh-4rem)] bg-card border-r transition-all duration-300 flex flex-col",
        collapsed ? "w-[68px]" : "w-[240px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className={cn(
          "flex items-center h-14 border-b px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">
                {isTeacher ? "Teacher Portal" : "Student Portal"}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {finalSidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            // Fix for dashboard matching everything if logic was loose, but exact match is better for root
            // For /classes, we want it active for /classes/123 too
            const isItemActive = item.href === "/dashboard" 
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isItemActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="p-4 border-t">
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-center text-muted-foreground">
              <p>Need help?</p>
              <Button variant="link" size="sm" className="h-auto p-0 mt-1">
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile menu button */}
        <div className="lg:hidden p-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4 mr-2" />
            Menu
          </Button>
        </div>
        {children}
      </main>
    </div>
  )
}
