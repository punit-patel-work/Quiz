import { prisma } from "@/lib/prisma"

/**
 * Checks if a user is the teacher of a given class.
 */
export async function isTeacher(classId: string, userId: string): Promise<boolean> {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  })
  
  return classData?.teacherId === userId
}

/**
 * Checks if a user is a Teaching Assistant (TA) for a given class.
 */
export async function isTA(classId: string, userId: string): Promise<boolean> {
  const member = await prisma.classMember.findUnique({
    where: {
      classId_userId: {
        classId,
        userId,
      },
    },
    select: { role: true },
  })
  
  return member?.role === "assistant"
}

/**
 * Fetches the specific permission flags for a class and checks if the TA is allowed to create/edit quizzes.
 */
export async function canTaCreateEditQuizzes(classId: string): Promise<boolean> {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { allowTaCreateEditQuizzes: true },
  })
  
  return classData?.allowTaCreateEditQuizzes || false
}

/**
 * Fetches the specific permission flags for a class and checks if the TA is allowed to grade scores.
 */
export async function canTaGradeScores(classId: string): Promise<boolean> {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { allowTaGradeScores: true },
  })
  
  return classData?.allowTaGradeScores || false
}

/**
 * Fetches the specific permission flags for a class and checks if the TA is allowed to grant retakes.
 */
export async function canTaGrantRetakes(classId: string): Promise<boolean> {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { allowTaGrantRetakes: true },
  })
  
  return classData?.allowTaGrantRetakes || false
}

/**
 * Convenience method to check if a user is authorized for Quiz Create/Edit.
 * Returns true if user is the Teacher OR if they are an active TA and the permission is enabled.
 */
export async function authorizeQuizEdit(classId: string, userId: string): Promise<boolean> {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true, allowTaCreateEditQuizzes: true },
  })

  if (!classData) return false

  // Teacher has full access
  if (classData.teacherId === userId) return true

  // If TA permissions are enabled, check if user is a TA
  if (classData.allowTaCreateEditQuizzes) {
    return await isTA(classId, userId)
  }

  return false
}

/**
 * Convenience method to check if a user is authorized for Grading.
 * Returns true if user is the Teacher OR if they are an active TA and the permission is enabled.
 */
export async function authorizeGrading(classId: string, userId: string): Promise<boolean> {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true, allowTaGradeScores: true },
  })

  if (!classData) return false

  if (classData.teacherId === userId) return true

  if (classData.allowTaGradeScores) {
    return await isTA(classId, userId)
  }

  return false
}

/**
 * Convenience method to check if a user is authorized to grant retakes.
 */
export async function authorizeRetakes(classId: string, userId: string): Promise<boolean> {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true, allowTaGrantRetakes: true },
  })

  if (!classData) return false

  if (classData.teacherId === userId) return true

  if (classData.allowTaGrantRetakes) {
    return await isTA(classId, userId)
  }

  return false
}
