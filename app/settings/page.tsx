"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Moon, Sun, Palette, Volume2, Bell, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface SettingsUser {
  id: string
  name: string
  email: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<SettingsUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("")
  const [useElevenLabs, setUseElevenLabs] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [lofiBackground, setLofiBackground] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()
  const { toast } = useToast()
  const router = useRouter()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/login")
      return
    }

    // Load settings
    const savedApiKey = localStorage.getItem("elevenLabsApiKey")
    const savedUseElevenLabs = localStorage.getItem("useElevenLabs")
    const savedNotifications = localStorage.getItem("notifications")
    const savedLofiBackground = localStorage.getItem("lofiBackground")

    if (savedApiKey) setElevenLabsApiKey(savedApiKey)
    setUseElevenLabs(savedUseElevenLabs === "true")
    setNotifications(savedNotifications !== "false") // Default to true
    setLofiBackground(savedLofiBackground !== "false") // Default to true

    setIsLoading(false)
  }, [router])

  const getCurrentTheme = () => {
    if (!mounted) return false
    return theme === "dark" || (theme === "system" && systemTheme === "dark")
  }

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light")
  }

  const saveSettings = () => {
    // Only update the API key if a new one is provided
    if (elevenLabsApiKey.trim()) {
      localStorage.setItem("elevenLabsApiKey", elevenLabsApiKey.trim())
    }

    // Always save the other settings
    localStorage.setItem("useElevenLabs", useElevenLabs.toString())
    localStorage.setItem("notifications", notifications.toString())
    localStorage.setItem("lofiBackground", lofiBackground.toString())

    // Apply lo-fi background setting
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("lofi-theme", lofiBackground)
    }

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const testElevenLabsKey = async () => {
    if (!elevenLabsApiKey.trim()) {
      toast({
        title: "No API Key",
        description: "Please enter your ElevenLabs API key first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Testing API key connection",
          style: "calm",
          apiKey: elevenLabsApiKey,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "API Key Valid!",
          description: "Your ElevenLabs API key is working correctly.",
        })
      } else {
        toast({
          title: "API Key Invalid",
          description: data.error || "Please check your API key.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not test API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testAndSaveSettings = async () => {
    if (useElevenLabs && elevenLabsApiKey.trim()) {
      await testElevenLabsKey()
    }

    saveSettings()

    if (useElevenLabs) {
      toast({
        title: "Premium Voices Enabled!",
        description: "ElevenLabs is now active for all coaching and inspiration features",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage all your MotivateME preferences in one place</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="container max-w-2xl space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={user.name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>
              <p className="text-xs text-muted-foreground">
                Profile information is currently read-only in this demo version.
              </p>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch checked={getCurrentTheme()} onCheckedChange={handleThemeChange} disabled={!mounted} />
                  <Moon className="h-4 w-4" />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Lo-Fi Background</Label>
                  <p className="text-sm text-muted-foreground">Enable aesthetic lo-fi themed backgrounds</p>
                </div>
                <Switch checked={lofiBackground} onCheckedChange={setLofiBackground} />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Audio & Voice
              </CardTitle>
              <CardDescription>Configure premium voices for coaching and daily inspiration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Premium Voices</Label>
                  <p className="text-sm text-muted-foreground">Enable ElevenLabs ultra-natural voices</p>
                </div>
                <Switch checked={useElevenLabs} onCheckedChange={setUseElevenLabs} />
              </div>

              {useElevenLabs && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="apiKey">ElevenLabs API Key</Label>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://elevenlabs.io/app/speech-synthesis" target="_blank" rel="noopener noreferrer">
                          Get Key <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk-..."
                      value={elevenLabsApiKey}
                      onChange={(e) => setElevenLabsApiKey(e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Used for both daily inspiration and coaching sessions</p>
                      <p>• API key is saved permanently until manually removed</p>
                      <p>• Free tier includes 10,000 characters per month</p>
                      <p>• Premium voices provide human-like quality</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded to track your mood and goals</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-2">
            <Button
              onClick={testAndSaveSettings}
              size="sm"
              disabled={(useElevenLabs && !elevenLabsApiKey.trim()) || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : useElevenLabs ? (
                "Save & Test API Key"
              ) : (
                "Save Settings"
              )}
            </Button>
            {elevenLabsApiKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setElevenLabsApiKey("")
                  localStorage.removeItem("elevenLabsApiKey")
                  localStorage.setItem("useElevenLabs", "false")
                  setUseElevenLabs(false)
                  toast({
                    title: "API Key Removed",
                    description: "ElevenLabs API key has been cleared from all components.",
                  })
                }}
              >
                Clear Key
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
