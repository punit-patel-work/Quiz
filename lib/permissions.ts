// Role and permission constants and helpers

export const Roles = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
} as const

export type Role = typeof Roles[keyof typeof Roles]

/**
 * Check if user is an admin
 */
export function isAdmin(role: string | undefined | null): boolean {
    return role === Roles.ADMIN
}

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: Role[] = [Roles.STUDENT, Roles.TEACHER, Roles.ADMIN]

/**
 * Check if a role has at least the minimum required role level
 */
export function hasMinRole(userRole: string, minRole: Role): boolean {
    const userIndex = ROLE_HIERARCHY.indexOf(userRole as Role)
    const minIndex = ROLE_HIERARCHY.indexOf(minRole)
    return userIndex >= minIndex
}

/**
 * Check if user can create classes (requires approved teacher)
 */
export function canCreateClass(role: string, isApproved: boolean): boolean {
    return (role === Roles.TEACHER || role === Roles.ADMIN) && isApproved
}

/**
 * Check if user can manage users
 */
export function canManageUsers(role: string): boolean {
    return role === Roles.ADMIN
}

/**
 * Check if user can approve teachers
 */
export function canApproveTeachers(role: string): boolean {
    return role === Roles.ADMIN
}

/**
 * Check if user can access admin dashboard
 */
export function canAccessAdmin(role: string): boolean {
    return role === Roles.ADMIN
}

/**
 * Check if user can modify quiz results
 */
export function canModifyResults(role: string, isClassTeacher: boolean): boolean {
    return role === Roles.ADMIN || (role === Roles.TEACHER && isClassTeacher)
}

/**
 * Check if user can grant retakes
 */
export function canGrantRetakes(role: string, isClassTeacher: boolean): boolean {
    return role === Roles.ADMIN || (role === Roles.TEACHER && isClassTeacher)
}

/**
 * Check if user can apply question corrections
 */
export function canApplyCorrections(role: string, isClassTeacher: boolean): boolean {
    return role === Roles.ADMIN || (role === Roles.TEACHER && isClassTeacher)
}

/**
 * Check if user can edit quiz (questions, timing)
 */
export function canEditQuiz(role: string, isClassTeacher: boolean): boolean {
    return role === Roles.ADMIN || (role === Roles.TEACHER && isClassTeacher)
}

/**
 * Check if user can view admin logs
 */
export function canViewLogs(role: string): boolean {
    return role === Roles.ADMIN
}

/**
 * Check if user can manage approved domains
 */
export function canManageDomains(role: string): boolean {
    return role === Roles.ADMIN
}

/**
 * Get display name for role
 */
export function getRoleDisplayName(role: string): string {
    switch (role) {
        case Roles.ADMIN:
            return 'Administrator'
        case Roles.TEACHER:
            return 'Teacher'
        case Roles.STUDENT:
            return 'Student'
        default:
            return 'Unknown'
    }
}

/**
 * Get role badge color class
 */
export function getRoleBadgeClass(role: string): string {
    switch (role) {
        case Roles.ADMIN:
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        case Roles.TEACHER:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        case Roles.STUDENT:
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
}
