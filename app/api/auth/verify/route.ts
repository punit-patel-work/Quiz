import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 }
            )
        }

        // Find the verification token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        })

        if (!verificationToken) {
            return NextResponse.json(
                { error: "Invalid or expired verification token" },
                { status: 400 }
            )
        }

        // Check if token has expired
        if (verificationToken.expires < new Date()) {
            await prisma.verificationToken.delete({
                where: { token },
            })
            return NextResponse.json(
                { error: "Verification token has expired" },
                { status: 400 }
            )
        }

        // Update user's emailVerified status
        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
        })

        // Delete the used token
        await prisma.verificationToken.delete({
            where: { token },
        })

        return NextResponse.json({
            message: "Email verified successfully! You can now log in.",
        })
    } catch (error) {
        console.error("Email verification error:", error)
        return NextResponse.json(
            { error: "Verification failed. Please try again." },
            { status: 500 }
        )
    }
}
