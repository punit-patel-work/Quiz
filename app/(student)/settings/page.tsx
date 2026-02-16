"use client"

import { SettingsForm } from "@/components/settings/settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and quiz defaults
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <SettingsForm />

        {/* Info Card */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">About Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • <strong>Theme:</strong> Changes take effect immediately
            </p>
            <p>
              • <strong>Default Time Limit:</strong> Applied to newly created quizzes
            </p>
            <p>
              • <strong>Show Explanations:</strong> Display answer explanations in results
            </p>
            <p>
              • <strong>Email Notifications:</strong> Receive updates about your quizzes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
