import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email"
import { z } from "zod"

const forgotPasswordSchema = z.object({
    email: z.string().email(),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email } = forgotPasswordSchema.parse(body)

        // Always return success to prevent email enumeration
        const successResponse = NextResponse.json({
            message: "If an account exists with that email, a password reset link has been sent.",
        })

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return successResponse
        }

        // Delete any existing reset tokens for this email
        await prisma.passwordResetToken.deleteMany({
            where: { email },
        })

        // Generate new token (expires in 1 hour)
        const token = generateVerificationToken()
        const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        })

        // Send reset email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        await sendPasswordResetEmail({
            to: email,
            token,
            baseUrl,
        })

        return successResponse
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Please enter a valid email address" },
                { status: 400 }
            )
        }

        console.error("Forgot password error:", error)
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}
