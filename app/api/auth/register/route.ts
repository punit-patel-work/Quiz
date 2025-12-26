import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateVerificationToken, getTokenExpiration } from "@/lib/auth-utils"
import { sendVerificationEmail } from "@/lib/email"
import { z } from "zod"

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = registerSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        })

        // Generate verification token
        const token = generateVerificationToken()
        const expires = getTokenExpiration()

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        })

        // Send verification email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://quiz-ivory-phi-77.vercel.app/"
        await sendVerificationEmail({
            to: email,
            token,
            baseUrl,
        })

        return NextResponse.json({
            message: "Registration successful. Please check your email to verify your account.",
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            )
        }

        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Registration failed. Please try again." },
            { status: 500 }
        )
    }
}
