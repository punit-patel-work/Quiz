import { prisma } from "@/lib/prisma"

type ActionType = 
  | "create_quiz" 
  | "update_quiz" 
  | "update_score" 
  | "grant_retake" 
  | "apply_correction" 
  | "make_ta" 
  | "remove_ta"

type TargetType = "quiz" | "attempt" | "question" | "member" | "class"

interface LogActivityParams {
  classId: string
  actorId: string
  action: ActionType
  targetType: TargetType
  targetId: string
  details?: any
}

/**
 * Logs a class-level activity/audit event (e.g., when a Teacher or TA modifies something).
 */
export async function logClassActivity({
  classId,
  actorId,
  action,
  targetType,
  targetId,
  details,
}: LogActivityParams) {
  try {
    // Determine the actor's role at this exact moment
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        members: { where: { userId: actorId } }
      }
    })

    if (!classData) {
      console.warn("Attempted to log activity for non-existent class", classId)
      return
    }

    let actorRole = "unknown"
    if (classData.teacherId === actorId) {
      actorRole = "teacher"
    } else if (classData.members && classData.members.length > 0) {
      actorRole = classData.members[0].role // likely "student" or "assistant"
    }

    // Insert into DB
    await prisma.classActivityLog.create({
      data: {
        classId,
        actorId,
        actorRole,
        action,
        targetType,
        targetId,
        details: details ? JSON.parse(JSON.stringify(details)) : null
      }
    })

    // If the actor is a TA, optionally send an in-app notification to the Teacher
    if (actorRole === "assistant" && action !== "make_ta") {
      const actorUser = await prisma.user.findUnique({ where: { id: actorId } })
      const actorName = actorUser?.name || "A Teaching Assistant"
      
      let humanAction = "performed an action"
      switch(action) {
        case "create_quiz": humanAction = "created a new quiz"; break;
        case "update_quiz": humanAction = "updated quiz settings"; break;
        case "update_score": humanAction = "updated a student's score"; break;
        case "grant_retake": humanAction = "granted a retake"; break;
        case "apply_correction": humanAction = "applied a question correction"; break;
      }

      await prisma.notification.create({
        data: {
          userId: classData.teacherId, // Notify the Teacher
          title: "TA Activity Log",
          message: `${actorName} ${humanAction} in ${classData.name}.`,
          type: "INFO",
          link: `/classes/${classId}/activity`
        }
      })
    }

  } catch (error) {
    console.error("Failed to log class activity:", error)
  }
}
