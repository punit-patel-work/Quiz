import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-utils"
import { z } from "zod"

const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token, password } = resetPasswordSchema.parse(body)

        // Find the reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        })

        if (!resetToken) {
            return NextResponse.json(
                { error: "Invalid or expired reset link. Please request a new one." },
                { status: 400 }
            )
        }

        // Check if token has expired
        if (resetToken.expires < new Date()) {
            // Clean up expired token
            await prisma.passwordResetToken.delete({
                where: { id: resetToken.id },
            })

            return NextResponse.json(
                { error: "This reset link has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Hash the new password
        const hashedPassword = await hashPassword(password)

        // Update the user's password
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword },
        })

        // Delete the used token (and any other tokens for this email)
        await prisma.passwordResetToken.deleteMany({
            where: { email: resetToken.email },
        })

        return NextResponse.json({
            message: "Password reset successful. You can now log in with your new password.",
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0]?.message || "Invalid input" },
                { status: 400 }
            )
        }

        console.error("Reset password error:", error)
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}
