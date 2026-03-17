const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    // Check current columns
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'class_quiz_attempts' ORDER BY ordinal_position`
    )
    const colNames = cols.map(r => r.column_name)
    console.log('Current columns:', colNames.join(', '))
    console.log('Has gradingStatus:', colNames.includes('gradingStatus'))
    
    if (!colNames.includes('gradingStatus')) {
      console.log('\nAdding gradingStatus column...')
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "class_quiz_attempts" ADD COLUMN "gradingStatus" TEXT NOT NULL DEFAULT 'none'`
      )
      console.log('Column added successfully!')
    }
    
    // Check descriptive_grades table
    const tables = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'descriptive_grades'`
    )
    console.log('\ndescriptive_grades table exists:', tables.length > 0)
    
    if (tables.length === 0) {
      console.log('Creating descriptive_grades table...')
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "descriptive_grades" (
          "id" TEXT NOT NULL,
          "attemptId" TEXT NOT NULL,
          "questionId" INTEGER NOT NULL,
          "score" INTEGER NOT NULL,
          "maxScore" INTEGER NOT NULL DEFAULT 1,
          "feedback" TEXT,
          "gradedById" TEXT NOT NULL,
          "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "descriptive_grades_pkey" PRIMARY KEY ("id")
        )
      `)
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "descriptive_grades_attemptId_questionId_key" ON "descriptive_grades"("attemptId", "questionId")`)
      await prisma.$executeRawUnsafe(`CREATE INDEX "descriptive_grades_attemptId_idx" ON "descriptive_grades"("attemptId")`)
      await prisma.$executeRawUnsafe(`ALTER TABLE "descriptive_grades" ADD CONSTRAINT "descriptive_grades_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "class_quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE`)
      await prisma.$executeRawUnsafe(`ALTER TABLE "descriptive_grades" ADD CONSTRAINT "descriptive_grades_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`)
      console.log('Table created successfully!')
    }
    
    // Verify final state
    const finalCols = await prisma.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'class_quiz_attempts' ORDER BY ordinal_position`
    )
    console.log('\nFinal columns:', finalCols.map(r => r.column_name).join(', '))
    
    // Count rows to check data
    const count = await prisma.$queryRawUnsafe(`SELECT count(*) as cnt FROM "class_quiz_attempts"`)
    console.log('Attempt rows:', count[0].cnt)
    
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}
main()
