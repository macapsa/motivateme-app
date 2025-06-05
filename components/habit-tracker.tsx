"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Plus, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

export function HabitTracker() {
  const [habits, setHabits] = useState([
    { id: 1, name: "Morning Meditation", streak: 5, completed: false },
    { id: 2, name: "Daily Journal", streak: 12, completed: true },
    { id: 3, name: "Exercise", streak: 3, completed: false },
    { id: 4, name: "Reading", streak: 7, completed: false },
  ])

  const toggleHabit = (id: number) => {
    setHabits(habits.map((habit) => (habit.id === id ? { ...habit, completed: !habit.completed } : habit)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-600" />
          Habit Tracker
        </CardTitle>
        <CardDescription>Build consistency with daily habits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant={habit.completed ? "default" : "outline"}
                    className={habit.completed ? "bg-green-600 hover:bg-green-700 h-8 w-8" : "h-8 w-8"}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    {habit.completed && <Check className="h-4 w-4" />}
                  </Button>
                  <span className="font-medium">{habit.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{habit.streak} day streak</span>
              </div>
              <Progress value={habit.streak * 10} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Habit
        </Button>
      </CardFooter>
    </Card>
  )
}
