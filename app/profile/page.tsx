"use client"

import { ProfileForm } from "@/components/profile/profile-form"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { User } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">
                Manage your account information and view your statistics
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <ProfileForm />

        {/* Password Change */}
        <PasswordChangeForm />
      </div>
    </div>
  )
}
