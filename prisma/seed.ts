import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create admin user
    const adminEmail = 'punitpatelcanada@gmail.com'
    const adminPassword = 'admin'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (existingAdmin) {
        // Update existing user to admin with new password
        await prisma.user.update({
            where: { email: adminEmail },
            data: {
                role: 'admin',
                isApproved: true,
                name: existingAdmin.name || 'Admin',
                password: hashedPassword, // Reset password to 'admin'
            }
        })
        console.log('✅ Updated existing user to admin:', adminEmail)
        console.log('   Password has been reset to: admin')
    } else {
        // Create new admin user
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Admin',
                role: 'admin',
                isApproved: true,
                emailVerified: new Date(),
            }
        })
        console.log('✅ Created admin user:', adminEmail)
    }

    // Create system settings if not exists
    const systemSettings = await prisma.systemSettings.findUnique({
        where: { id: 'system' }
    })

    if (!systemSettings) {
        await prisma.systemSettings.create({
            data: {
                id: 'system',
                siteName: 'Quiz Platform',
                allowRegistration: true,
                requireEmailVerify: true,
            }
        })
        console.log('✅ Created system settings')
    }

    console.log('🎉 Seeding complete!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
