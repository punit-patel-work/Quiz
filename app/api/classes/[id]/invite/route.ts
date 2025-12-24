import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

// POST /api/classes/[id]/invite - Invite students by email
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Check if user is teacher
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData) {
            return NextResponse.json(
                { error: "Class not found" },
                { status: 404 }
            )
        }

        if (classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the teacher can invite students" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { emails } = body

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json(
                { error: "At least one email is required" },
                { status: 400 }
            )
        }

        // Validate and normalize emails
        const validEmails = emails
            .map((email: string) => email.trim().toLowerCase())
            .filter((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))

        if (validEmails.length === 0) {
            return NextResponse.json(
                { error: "No valid email addresses provided" },
                { status: 400 }
            )
        }

        // Remove duplicates
        const uniqueEmails = [...new Set(validEmails)]

        // Get teacher info for email
        const teacher = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, email: true },
        })

        const results = {
            invited: [] as string[],
            alreadyMember: [] as string[],
            alreadyInvited: [] as string[],
            failed: [] as string[],
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Expire in 7 days

        for (const email of uniqueEmails) {
            try {
                // Check if user is already a member
                const existingUser = await prisma.user.findUnique({
                    where: { email },
                })

                if (existingUser) {
                    // Check if already a member
                    const existingMember = await prisma.classMember.findUnique({
                        where: {
                            classId_userId: {
                                classId: params.id,
                                userId: existingUser.id,
                            },
                        },
                    })

                    if (existingMember) {
                        results.alreadyMember.push(email)
                        continue
                    }
                }

                // Check for existing pending invitation
                const existingInvite = await prisma.classInvitation.findUnique({
                    where: {
                        classId_email: {
                            classId: params.id,
                            email,
                        },
                    },
                })

                if (existingInvite && existingInvite.status === "pending") {
                    results.alreadyInvited.push(email)
                    continue
                }

                // Create or update invitation
                const invitation = await prisma.classInvitation.upsert({
                    where: {
                        classId_email: {
                            classId: params.id,
                            email,
                        },
                    },
                    update: {
                        status: "pending",
                        expiresAt,
                    },
                    create: {
                        classId: params.id,
                        email,
                        expiresAt,
                    },
                })

                // Send email
                const isExistingUser = !!existingUser
                const inviteUrl = isExistingUser
                    ? `${process.env.NEXTAUTH_URL}/invitations`
                    : `${process.env.NEXTAUTH_URL}/register?invite=${invitation.token}`

                await sendEmail({
                    to: email,
                    subject: `Invitation to join ${classData.name}`,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">You've been invited to a class!</h1>
              <p>
                <strong>${teacher?.name || "A teacher"}</strong> has invited you to join 
                their class <strong>${classData.name}</strong> on Quiz Platform.
              </p>
              ${classData.description ? `<p style="color: #666;">${classData.description}</p>` : ""}
              <div style="margin: 30px 0;">
                <a href="${inviteUrl}" 
                   style="background-color: #6366f1; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  ${isExistingUser ? "View Invitation" : "Create Account & Join"}
                </a>
              </div>
              ${!isExistingUser ? `
                <p style="color: #666; font-size: 14px;">
                  You'll need to create an account first to join the class.
                </p>
              ` : ""}
              <p style="color: #999; font-size: 12px;">
                This invitation expires in 7 days.
              </p>
            </div>
          `,
                })

                results.invited.push(email)
            } catch (error) {
                console.error(`Failed to invite ${email}:`, error)
                results.failed.push(email)
            }
        }

        return NextResponse.json({
            message: "Invitations processed",
            results,
        })
    } catch (error) {
        console.error("Invitation error:", error)
        return NextResponse.json(
            { error: "Failed to send invitations" },
            { status: 500 }
        )
    }
}

// GET /api/classes/[id]/invite - Get pending invitations for class
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Check if user is teacher
        const classData = await prisma.class.findUnique({
            where: { id: params.id },
        })

        if (!classData) {
            return NextResponse.json(
                { error: "Class not found" },
                { status: 404 }
            )
        }

        if (classData.teacherId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the teacher can view invitations" },
                { status: 403 }
            )
        }

        const invitations = await prisma.classInvitation.findMany({
            where: { classId: params.id },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(invitations)
    } catch (error) {
        console.error("Invitations fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch invitations" },
            { status: 500 }
        )
    }
}
