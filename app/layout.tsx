import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { auth } from "@/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/auth/user-nav"
import Link from "next/link"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quiz Platform - Test Your Knowledge",
  description: "Upload custom JSON quizzes and test your knowledge",
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
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">Q</span>
                    </div>
                    <span className="font-bold text-xl">Quiz Platform</span>
                  </Link>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {session?.user ? (
                      <UserNav user={session.user} />
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

              {/* Footer */}
              <footer className="border-t py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                  <p>© {new Date().getFullYear()} Quiz Platform. All rights reserved.</p>
                </div>
              </footer>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
