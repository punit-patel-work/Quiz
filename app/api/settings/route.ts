import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/settings - Fetch user settings
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        let settings = await prisma.userSettings.findUnique({
            where: { userId: session.user.id },
        })

        // Create default settings if they don't exist
        if (!settings) {
            settings = await prisma.userSettings.create({
                data: {
                    userId: session.user.id,
                },
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Settings fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        )
    }
}

// PUT /api/settings - Update user settings
export async function PUT(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { theme, defaultTimeLimit, showExplanations, emailNotifications } = body

        const settings = await prisma.userSettings.upsert({
            where: { userId: session.user.id },
            update: {
                theme,
                defaultTimeLimit,
                showExplanations,
                emailNotifications,
            },
            create: {
                userId: session.user.id,
                theme,
                defaultTimeLimit,
                showExplanations,
                emailNotifications,
            },
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Settings update error:", error)
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        )
    }
}
