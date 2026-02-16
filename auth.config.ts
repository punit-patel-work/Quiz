import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
            const isOnQuiz = nextUrl.pathname.startsWith("/quiz")
            const isOnSetup = nextUrl.pathname.startsWith("/setup")

            if (isOnDashboard || isOnQuiz || isOnSetup) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Optional: Redirect logged-in users away from login/register?
                // For now, let them access public pages
            }
            return true
        },
    },
    providers: [], // Providers allocated in auth.ts
} satisfies NextAuthConfig
