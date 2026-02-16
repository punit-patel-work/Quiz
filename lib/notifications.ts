import { prisma } from "@/lib/prisma"

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR"

interface CreateNotificationParams {
    userId: string
    title: string
    message: string
    type?: NotificationType
    link?: string
}

export async function createNotification({
    userId,
    title,
    message,
    type = "INFO",
    link,
}: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            },
        })
        return notification
    } catch (error) {
        console.error("Failed to create notification:", error)
        return null
    }
}

export async function createClassNotification({
    classId,
    title,
    message,
    type = "INFO",
    link,
    excludeUserId,
}: Omit<CreateNotificationParams, "userId"> & { classId: string; excludeUserId?: string }) {
    try {
        // efficient batch create for all class members
        const members = await prisma.classMember.findMany({
            where: {
                classId,
                userId: excludeUserId ? { not: excludeUserId } : undefined,
            },
            select: { userId: true },
        })

        if (members.length === 0) return 0

        await prisma.notification.createMany({
            data: members.map((m) => ({
                userId: m.userId,
                title,
                message,
                type,
                link,
            })),
        })

        return members.length
    } catch (error) {
        console.error("Failed to batch create notifications:", error)
        return 0
    }
}
