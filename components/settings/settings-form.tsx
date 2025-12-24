"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SettingsFormProps {
  onSaved?: () => void
}

export function SettingsForm({ onSaved }: SettingsFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    theme: "system",
    defaultTimeLimit: 30,
    showExplanations: true,
    emailNotifications: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        setSettings({
          theme: data.theme || "system",
          defaultTimeLimit: data.defaultTimeLimit || 30,
          showExplanations: data.showExplanations ?? true,
          emailNotifications: data.emailNotifications ?? true,
        })
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast({
          title: "Settings Saved",
          description: "Your preferences have been updated successfully.",
        })
        
        // Apply theme change if needed
        if (settings.theme !== "system") {
          document.documentElement.classList.remove("light", "dark")
          document.documentElement.classList.add(settings.theme)
        } else {
          document.documentElement.classList.remove("light", "dark")
        }
        
        onSaved?.()
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      theme: "system",
      defaultTimeLimit: 30,
      showExplanations: true,
      emailNotifications: true,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the app looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) =>
                setSettings({ ...settings, theme: value })
              }
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose your preferred color theme
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Defaults</CardTitle>
          <CardDescription>
            Set default values for your quizzes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timeLimit">Default Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="1"
              max="180"
              value={settings.defaultTimeLimit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultTimeLimit: parseInt(e.target.value) || 30,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Default time limit for new quizzes (1-180 minutes)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showExplanations">Show Explanations</Label>
              <p className="text-sm text-muted-foreground">
                Display answer explanations after quiz completion
              </p>
            </div>
            <Switch
              id="showExplanations"
              checked={settings.showExplanations}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showExplanations: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about quiz results and updates
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSaving}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
