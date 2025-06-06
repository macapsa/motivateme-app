"use client"

import { AudioCoaching } from "@/components/audio-coaching"
import { AudioPermissionBanner } from "@/components/audio-permission-banner"
import { DailyGoals } from "@/components/daily-goals"
import { EventNotification } from "@/components/event-notification"
import { HabitTracker } from "@/components/habit-tracker"
import { MoodChart } from "@/components/mood-chart"
import { MoodTracker } from "@/components/mood-tracker"
import { ScheduleManager } from "@/components/schedule-manager"
import { Button } from "@/components/ui/button"
import InspireCard from '@/components/ui/InspireCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatePresence } from "framer-motion"
import { BarChart3, Calendar, ListTodo, LogOut, Mic, Settings, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


interface User {
  id: string
  name: string
  email: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshMoodChart, setRefreshMoodChart] = useState(0)
  const [activeEventNotification, setActiveEventNotification] = useState<{
    id: number
    title: string
    description?: string
    time: string
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/login")
    }

    // Apply lo-fi theme if enabled
    const lofiBackground = localStorage.getItem("lofiBackground")
    if (lofiBackground !== "false") {
      document.documentElement.classList.add("lofi-theme")
    }

    setIsLoading(false)
  }, [router])

  useEffect(() => {
    // Listen for mood save events to refresh the chart
    const handleMoodSaved = () => {
      setRefreshMoodChart((prev) => prev + 1)
    }

    window.addEventListener("moodSaved", handleMoodSaved)
    return () => window.removeEventListener("moodSaved", handleMoodSaved)
  }, [])

  useEffect(() => {
    const handleScheduleNotification = (event: CustomEvent) => {
      setActiveEventNotification(event.detail)
    }

    window.addEventListener("scheduleNotification", handleScheduleNotification as EventListener)
    return () => window.removeEventListener("scheduleNotification", handleScheduleNotification as EventListener)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
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
    return null // Will redirect to login
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-bold">MotivateME</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="container space-y-6">
          <AudioPermissionBanner />
          
          <InspireCard />

          <MoodTracker />

          <Tabs defaultValue="goals" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="goals">
                <ListTodo className="h-4 w-4 mr-2" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="mood">
                <BarChart3 className="h-4 w-4 mr-2" />
                Mood
              </TabsTrigger>
              <TabsTrigger value="coaching">
                <Mic className="h-4 w-4 mr-2" />
                Coaching
              </TabsTrigger>
              <TabsTrigger value="habits">
                <Trophy className="h-4 w-4 mr-2" />
                Habits
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </TabsTrigger>
            </TabsList>
            <TabsContent value="goals" className="space-y-4 pt-4">
              <DailyGoals />
            </TabsContent>
            <TabsContent value="mood" className="space-y-4 pt-4">
              <MoodChart key={refreshMoodChart} />
            </TabsContent>
            <TabsContent value="coaching" className="space-y-4 pt-4">
              <AudioCoaching />
            </TabsContent>
            <TabsContent value="habits" className="space-y-4 pt-4">
              <HabitTracker />
            </TabsContent>
            <TabsContent value="schedule" className="space-y-4 pt-4">
              <ScheduleManager />
            </TabsContent>
          </Tabs>
          {/* Event Notification Overlay */}
          <AnimatePresence>
            {activeEventNotification && (
              <EventNotification
                event={activeEventNotification}
                onDismiss={() => setActiveEventNotification(null)}
                onComplete={() => {
                  // Mark event as completed in schedule
                  const event = new CustomEvent("markEventComplete", {
                    detail: { id: activeEventNotification.id },
                  })
                  window.dispatchEvent(event)
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
      <nav className="sticky bottom-0 border-t bg-background/80 backdrop-blur-sm">
        <div className="container flex justify-between items-center h-16">
          <Button variant="ghost" className="flex-1 flex-col h-16 rounded-none">
            <ListTodo className="h-5 w-5" />
            <span className="text-xs mt-1">Goals</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex-col h-16 rounded-none">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Mood</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex-col h-16 rounded-none">
            <Mic className="h-5 w-5" />
            <span className="text-xs mt-1">Coaching</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex-col h-16 rounded-none">
            <Trophy className="h-5 w-5" />
            <span className="text-xs mt-1">Habits</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex-col h-16 rounded-none">
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Schedule</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}
