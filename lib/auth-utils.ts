import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12)
    return bcrypt.hash(password, salt)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a random verification token
 */
export function generateVerificationToken(): string {
    return randomBytes(32).toString('hex')
}

/**
 * Create expiration date for verification token (24 hours from now)
 */
export function getTokenExpiration(): Date {
    return new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
}
