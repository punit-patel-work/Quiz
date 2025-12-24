import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { RegisterForm } from "@/components/auth/register-form"

export default async function RegisterPage() {
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">
            Sign up to start taking quizzes and tracking your progress.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
