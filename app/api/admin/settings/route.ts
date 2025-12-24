import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/permissions"

// GET /api/admin/settings - Get system settings
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const settings = await prisma.systemSettings.findFirst()

        return NextResponse.json(settings || {
            requireTeacherApproval: true,
            allowNewRegistrations: true,
            maintenanceMode: false,
        })
    } catch (error) {
        console.error("Settings fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }
}

// PUT /api/admin/settings - Update system settings
export async function PUT(request: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user || !isAdmin(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const { requireTeacherApproval, allowNewRegistrations, maintenanceMode } = body

        // Upsert settings
        const existingSettings = await prisma.systemSettings.findFirst()

        let settings
        if (existingSettings) {
            settings = await prisma.systemSettings.update({
                where: { id: existingSettings.id },
                data: {
                    requireTeacherApproval: requireTeacherApproval ?? existingSettings.requireTeacherApproval,
                    allowNewRegistrations: allowNewRegistrations ?? existingSettings.allowNewRegistrations,
                    maintenanceMode: maintenanceMode ?? existingSettings.maintenanceMode,
                },
            })
        } else {
            settings = await prisma.systemSettings.create({
                data: {
                    requireTeacherApproval: requireTeacherApproval ?? true,
                    allowNewRegistrations: allowNewRegistrations ?? true,
                    maintenanceMode: maintenanceMode ?? false,
                },
            })
        }

        // Log action
        await prisma.adminLog.create({
            data: {
                action: "UPDATE_SETTINGS",
                targetType: "settings",
                targetId: settings.id,
                performedById: user.id,
                details: body,
            },
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Settings update error:", error)
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }
}
