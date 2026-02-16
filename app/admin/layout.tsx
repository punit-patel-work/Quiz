"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, Users, BookOpen, FileText, UserCheck, 
  Settings, Clock, ChevronLeft, ChevronRight, Shield, Menu, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: BookOpen },
  { href: "/admin/quizzes", label: "Quizzes", icon: FileText },
  { href: "/admin/applications", label: "Applications", icon: UserCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/logs", label: "Audit Logs", icon: Clock },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">Admin Panel</span>
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
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive 
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
            <p className="text-xs text-muted-foreground text-center">
              Quiz Platform Admin
            </p>
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
            Admin Menu
          </Button>
        </div>
        {children}
      </main>
    </div>
  )
}
