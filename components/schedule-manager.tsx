"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Plus, Edit, Trash2, Calendar, Bell, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScheduleEvent {
  id: number
  time: string
  title: string
  description?: string
  createdAt: number
}

export function ScheduleManager() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [newEvent, setNewEvent] = useState({
    time: "",
    title: "",
    description: "",
  })
  const { toast } = useToast()

  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activeNotifications, setActiveNotifications] = useState<number[]>([])

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("scheduleEvents")
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    } else {
      // Initialize with some default events
      const defaultEvents: ScheduleEvent[] = [
        {
          id: 1,
          time: "09:00",
          title: "Morning Meditation",
          description: "Start the day with mindfulness",
          createdAt: Date.now(),
        },
        {
          id: 2,
          time: "13:00",
          title: "Project Planning",
          description: "Review and plan upcoming tasks",
          createdAt: Date.now(),
        },
        {
          id: 3,
          time: "18:00",
          title: "Evening Exercise",
          description: "30 minutes of physical activity",
          createdAt: Date.now(),
        },
      ]
      setEvents(defaultEvents)
      localStorage.setItem("scheduleEvents", JSON.stringify(defaultEvents))
    }
  }, [])

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem("scheduleEvents", JSON.stringify(events))
  }, [events])

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true)
      } else if (Notification.permission === "default") {
        // Request permission
        Notification.requestPermission().then((permission) => {
          setNotificationsEnabled(permission === "granted")
        })
      }
    }

    // Load sound preference
    const savedSoundEnabled = localStorage.getItem("scheduleSound")
    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === "true")
    }
  }, [])

  useEffect(() => {
    const checkEventTimes = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

      events.forEach((event) => {
        if (event.time === currentTime && !activeNotifications.includes(event.id)) {
          triggerEventNotification(event)
          setActiveNotifications((prev) => [...prev, event.id])

          // Remove from active notifications after 1 minute to allow re-triggering
          setTimeout(() => {
            setActiveNotifications((prev) => prev.filter((id) => id !== event.id))
          }, 60000)
        }
      })
    }

    // Check every minute
    const interval = setInterval(checkEventTimes, 60000)

    // Also check immediately
    checkEventTimes()

    return () => clearInterval(interval)
  }, [events, activeNotifications, notificationsEnabled, soundEnabled])

  const playNotificationSound = () => {
    if (!soundEnabled) return

    // Create a pleasant notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Create a pleasant chime sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const triggerEventNotification = (event: ScheduleEvent) => {
    // Play sound
    playNotificationSound()

    // Show browser notification
    if (notificationsEnabled && "Notification" in window) {
      const notification = new Notification(`⏰ ${event.title}`, {
        body: event.description || "It's time for your scheduled event!",
        icon: "/images/motivateme-logo.png",
        badge: "/images/motivateme-logo.png",
        tag: `event-${event.id}`,
        requireInteraction: true,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000)
    }

    // Dispatch custom event for in-app notification
    const customEvent = new CustomEvent("scheduleNotification", {
      detail: {
        id: event.id,
        title: event.title,
        description: event.description,
        time: formatTime(event.time),
      },
    })
    window.dispatchEvent(customEvent)

    // Show toast notification as backup
    toast({
      title: `⏰ ${event.title}`,
      description: event.description || "It's time for your scheduled event!",
      duration: 10000,
    })
  }

  useEffect(() => {
    const handleMarkComplete = (event: CustomEvent) => {
      const eventId = event.detail.id
      // You could add completion logic here if needed
      toast({
        title: "Event Completed",
        description: "Great job staying on schedule!",
      })
    }

    window.addEventListener("markEventComplete", handleMarkComplete as EventListener)
    return () => window.removeEventListener("markEventComplete", handleMarkComplete as EventListener)
  }, [])

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled
    setSoundEnabled(newSoundEnabled)
    localStorage.setItem("scheduleSound", newSoundEnabled.toString())

    if (newSoundEnabled) {
      playNotificationSound() // Test sound
      toast({
        title: "Sound Enabled",
        description: "You'll now hear alerts for scheduled events.",
      })
    } else {
      toast({
        title: "Sound Disabled",
        description: "Event alerts will be silent.",
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === "granted")

      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive pop-up alerts for scheduled events.",
        })
      } else {
        toast({
          title: "Notifications Denied",
          description: "You can enable them later in your browser settings.",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setNewEvent({ time: "", title: "", description: "" })
    setEditingEvent(null)
  }

  const openDialog = (event?: ScheduleEvent) => {
    if (event) {
      setEditingEvent(event)
      setNewEvent({
        time: event.time,
        title: event.title,
        description: event.description || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const saveEvent = () => {
    if (!newEvent.time || !newEvent.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both time and title for the event.",
        variant: "destructive",
      })
      return
    }

    if (editingEvent) {
      // Update existing event
      setEvents(
        events.map((event) =>
          event.id === editingEvent.id
            ? { ...event, time: newEvent.time, title: newEvent.title.trim(), description: newEvent.description.trim() }
            : event,
        ),
      )
      toast({
        title: "Event Updated",
        description: "Your schedule event has been updated successfully.",
      })
    } else {
      // Create new event
      const event: ScheduleEvent = {
        id: Date.now(),
        time: newEvent.time,
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        createdAt: Date.now(),
      }
      setEvents([...events, event].sort((a, b) => a.time.localeCompare(b.time)))
      toast({
        title: "Event Added",
        description: "New event has been added to your schedule.",
      })
    }

    closeDialog()
  }

  const deleteEvent = (id: number) => {
    const eventToDelete = events.find((event) => event.id === id)
    setEvents(events.filter((event) => event.id !== id))
    toast({
      title: "Event Deleted",
      description: `"${eventToDelete?.title}" has been removed from your schedule.`,
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        options.push(timeString)
      }
    }
    return options
  }

  return (
    <Card data-card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Manage your events and reminders</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className={soundEnabled ? "text-green-600" : "text-muted-foreground"}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={requestNotificationPermission}
              className={notificationsEnabled ? "text-green-600" : "text-muted-foreground"}
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No events scheduled. Add your first event below!</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-center justify-between border-b pb-2 group">
                <div className="flex items-center gap-3 flex-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{formatTime(event.time)}</span>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => openDialog(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {events.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Notifications</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Bell className={`h-3 w-3 ${notificationsEnabled ? "text-green-600" : "text-muted-foreground"}`} />
                  <span className="text-xs">{notificationsEnabled ? "On" : "Off"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Volume2 className={`h-3 w-3 ${soundEnabled ? "text-green-600" : "text-muted-foreground"}`} />
                  <span className="text-xs">{soundEnabled ? "On" : "Off"}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {notificationsEnabled && soundEnabled
                ? "You'll receive pop-up and sound alerts for events"
                : notificationsEnabled
                  ? "You'll receive pop-up alerts for events"
                  : soundEnabled
                    ? "You'll receive sound alerts for events"
                    : "Click the icons above to enable notifications"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Update your schedule event details." : "Create a new event for your schedule."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Select value={newEvent.time} onValueChange={(value) => setNewEvent({ ...newEvent, time: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Event description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={saveEvent}>{editingEvent ? "Update Event" : "Add Event"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
