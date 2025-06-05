"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { SmilePlus, Frown, Meh, Smile } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MoodEntry {
  date: string
  mood: number
  timestamp: number
}

export function MoodTracker() {
  const [moodValue, setMoodValue] = useState(50)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved mood from localStorage
    const savedMood = localStorage.getItem("currentMood")
    if (savedMood) {
      setMoodValue(Number.parseInt(savedMood))
    }
  }, [])

  const saveMood = () => {
    // Save current mood
    localStorage.setItem("currentMood", moodValue.toString())

    // Add to mood history
    const today = new Date()
    const dateString = today.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })

    const newEntry: MoodEntry = {
      date: dateString,
      mood: moodValue,
      timestamp: today.getTime(),
    }

    // Get existing history
    const existingHistory = localStorage.getItem("moodHistory")
    let moodHistory: MoodEntry[] = existingHistory ? JSON.parse(existingHistory) : []

    // Check if we already have an entry for today
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1

    const existingTodayIndex = moodHistory.findIndex(
      (entry) => entry.timestamp >= todayStart && entry.timestamp <= todayEnd,
    )

    if (existingTodayIndex >= 0) {
      // Update existing entry for today
      moodHistory[existingTodayIndex] = newEntry
      toast({
        title: "Mood Updated!",
        description: "Your mood for today has been updated in your tracking history.",
      })
    } else {
      // Add new entry
      moodHistory.push(newEntry)
      toast({
        title: "Mood Saved!",
        description: "Your mood has been added to your tracking history.",
      })
    }

    // Keep only last 90 days of data
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000
    moodHistory = moodHistory.filter((entry) => entry.timestamp > ninetyDaysAgo)

    // Save updated history
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory))

    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent("moodSaved"))
  }

  const getMoodIcon = () => {
    if (moodValue < 33) return <Frown className="h-6 w-6 text-red-500" />
    if (moodValue < 66) return <Meh className="h-6 w-6 text-amber-500" />
    return <Smile className="h-6 w-6 text-green-500" />
  }

  const getMoodText = () => {
    if (moodValue < 33) return "Low energy"
    if (moodValue < 66) return "Moderate energy"
    return "High energy"
  }

  const getMoodDescription = () => {
    if (moodValue < 33) return "Take it easy today. Focus on self-care and gentle progress."
    if (moodValue < 66) return "You're doing okay. Small steps forward count!"
    return "You're feeling great! This is perfect energy for tackling challenges."
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SmilePlus className="h-5 w-5 text-purple-600" />
          How are you feeling today?
        </CardTitle>
        <CardDescription>Track your mood to get personalized coaching content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            {getMoodIcon()}
            <div className="text-center">
              <span className="text-lg font-medium">{getMoodText()}</span>
              <p className="text-sm text-muted-foreground mt-1">{getMoodDescription()}</p>
            </div>
          </div>
          <Slider
            value={[moodValue]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => setMoodValue(value[0])}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low Energy</span>
            <span>High Energy</span>
          </div>
          <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={saveMood}>
            Save Today's Mood
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
