import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { auth } from "@/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/auth/user-nav"
import { NotificationBell } from "@/components/layout/notification-bell"
import { SiteFooter } from "@/components/layout/site-footer"
import Link from "next/link"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

import Image from "next/image"

export const metadata: Metadata = {
  title: "QuizFlow | Open Source Quiz Platform for Teachers",
  description: "Create, assign, and automatically grade quizzes. Support for JSON uploads, multiple choice, and descriptive manual grading.",
  keywords: ["quiz platform", "open source", "teacher tools", "json quizzes", "grading", "education"],
  authors: [{ name: "QuizFlow Team" }],
  icons: {
    icon: "/favicon.svg",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col">
              {/* Navigation */}
              <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <Image 
                        src="/logo.svg" 
                        alt="Quiz Platform Logo" 
                        fill 
                        className="object-contain"
                      />
                    </div>
                    <span className="font-bold text-xl ml-1">Quiz Platform</span>
                  </Link>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {session?.user ? (
                      <>
                        <NotificationBell />
                        <UserNav user={session.user} />
                      </>
                    ) : (
                      <nav className="flex items-center gap-4">
                        <Link
                          href="/login"
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Sign Up
                        </Link>
                      </nav>
                    )}
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1">
                {children}
              </main>

              {/* Enhanced Footer */}
              <SiteFooter />
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
