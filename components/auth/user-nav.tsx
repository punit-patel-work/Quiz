"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { User, LogOut, LayoutDashboard, Settings, UserCircle, GraduationCap, BookOpen, Mail, Shield, UserPlus } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { getRoleBadgeClass, getRoleDisplayName } from "@/lib/permissions"

interface UserNavProps {
  user: {
    email: string
    name?: string | null
  }
}

export function UserNav({ user }: UserNavProps) {
  const [userRole, setUserRole] = useState<string>("student")

  useEffect(() => {
    // Fetch user role
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/auth/session")
        if (res.ok) {
          const data = await res.json()
          // We'll store role in session - for now fetch from API
        }
      } catch (error) {
        console.error("Failed to fetch role")
      }
    }

    // Get role from a dedicated endpoint (we'll create a simple one)
    const fetchUserDetails = async () => {
      try {
        const res = await fetch("/api/me")
        if (res.ok) {
          const data = await res.json()
          if (data.role) {
            setUserRole(data.role)
          }
        }
      } catch (error) {
        // Default to student
      }
    }

    fetchUserDetails()
  }, [])

  const isTeacher = userRole === "teacher" || userRole === "admin"
  const isAdmin = userRole === "admin"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeClass(userRole)}`}>
                {getRoleDisplayName(userRole)}
              </span>
            </div>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Admin gets simplified menu */}
        {isAdmin ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {/* Classes Section - Only for non-admins */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">Classes</DropdownMenuLabel>
            {isTeacher ? (
              <DropdownMenuItem asChild>
                <Link href="/classes" className="cursor-pointer">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span>My Classes (Teacher)</span>
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/become-teacher" className="cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Become a Teacher</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/my-classes" className="cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Joined Classes (Student)</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/invitations" className="cursor-pointer">
                <Mail className="mr-2 h-4 w-4" />
                <span>Invitations</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
