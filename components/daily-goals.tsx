"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Target, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Goal {
  id: number
  text: string
  completed: boolean
  createdAt: number
  completedAt?: number
}

export function DailyGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState("")
  const { toast } = useToast()

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem("dailyGoals")
    if (savedGoals) {
      const parsedGoals: Goal[] = JSON.parse(savedGoals)

      // Clean up completed goals older than 24 hours
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      const filteredGoals = parsedGoals.filter((goal) => {
        if (goal.completed && goal.completedAt) {
          return now - goal.completedAt < twentyFourHours
        }
        return true
      })

      // If any goals were removed, show notification
      if (filteredGoals.length < parsedGoals.length) {
        const removedCount = parsedGoals.length - filteredGoals.length
        toast({
          title: "Goals Cleaned Up",
          description: `${removedCount} completed goal${removedCount > 1 ? "s" : ""} from yesterday ${removedCount > 1 ? "have" : "has"} been automatically removed.`,
        })
      }

      setGoals(filteredGoals)

      // Save the cleaned goals back to localStorage
      if (filteredGoals.length !== parsedGoals.length) {
        localStorage.setItem("dailyGoals", JSON.stringify(filteredGoals))
      }
    } else {
      // Initialize with some default goals if none exist
      const defaultGoals: Goal[] = [
        { id: 1, text: "Complete project proposal", completed: false, createdAt: Date.now() },
        { id: 2, text: "Exercise for 30 minutes", completed: false, createdAt: Date.now() },
        { id: 3, text: "Read 20 pages", completed: true, createdAt: Date.now() - 1000, completedAt: Date.now() },
      ]
      setGoals(defaultGoals)
      localStorage.setItem("dailyGoals", JSON.stringify(defaultGoals))
    }
  }, [toast])

  // Auto-cleanup effect that runs every hour
  useEffect(() => {
    const cleanupInterval = setInterval(
      () => {
        setGoals((currentGoals) => {
          const now = Date.now()
          const twentyFourHours = 24 * 60 * 60 * 1000

          const filteredGoals = currentGoals.filter((goal) => {
            if (goal.completed && goal.completedAt) {
              return now - goal.completedAt < twentyFourHours
            }
            return true
          })

          if (filteredGoals.length < currentGoals.length) {
            localStorage.setItem("dailyGoals", JSON.stringify(filteredGoals))
            const removedCount = currentGoals.length - filteredGoals.length
            toast({
              title: "Goals Auto-Cleaned",
              description: `${removedCount} completed goal${removedCount > 1 ? "s" : ""} ${removedCount > 1 ? "have" : "has"} been automatically removed after 24 hours.`,
            })
          }

          return filteredGoals
        })
      },
      60 * 60 * 1000,
    ) // Check every hour

    return () => clearInterval(cleanupInterval)
  }, [toast])

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem("dailyGoals", JSON.stringify(goals))
  }, [goals])

  const addGoal = () => {
    if (newGoal.trim() === "") return

    const goal: Goal = {
      id: Date.now(),
      text: newGoal.trim(),
      completed: false,
      createdAt: Date.now(),
    }

    setGoals([...goals, goal])
    setNewGoal("")

    toast({
      title: "Goal Added",
      description: "Your new goal has been added to today's list.",
    })
  }

  const toggleGoal = (id: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          const updatedGoal = {
            ...goal,
            completed: !goal.completed,
            completedAt: !goal.completed ? Date.now() : undefined,
          }

          if (!goal.completed) {
            toast({
              title: "Goal Completed! 🎉",
              description: "Great job! This goal will be automatically removed in 24 hours.",
            })
          }

          return updatedGoal
        }
        return goal
      }),
    )
  }

  const removeGoal = (id: number) => {
    const goalToRemove = goals.find((goal) => goal.id === id)
    setGoals(goals.filter((goal) => goal.id !== id))

    toast({
      title: "Goal Removed",
      description: `"${goalToRemove?.text}" has been removed from your goals.`,
    })
  }

  const getTimeUntilRemoval = (completedAt: number) => {
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000
    const timeLeft = twentyFourHours - (now - completedAt)

    if (timeLeft <= 0) return "Removing soon..."

    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000))
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))

    if (hoursLeft > 0) {
      return `Removes in ${hoursLeft}h ${minutesLeft}m`
    } else {
      return `Removes in ${minutesLeft}m`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Daily Goals
        </CardTitle>
        <CardDescription>What do you want to accomplish today?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="group relative">
              <div className="flex items-center space-x-2">
                <Checkbox id={`goal-${goal.id}`} checked={goal.completed} onCheckedChange={() => toggleGoal(goal.id)} />
                <label
                  htmlFor={`goal-${goal.id}`}
                  className={`flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                    goal.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {goal.text}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {goal.completed && goal.completedAt && (
                <div className="ml-6 mt-1">
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    ✓ Completed • {getTimeUntilRemoval(goal.completedAt)}
                  </span>
                </div>
              )}
            </div>
          ))}

          {goals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No goals yet. Add your first goal below!</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Add a new goal..."
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
          />
          <Button size="icon" onClick={addGoal} disabled={!newGoal.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-full space-y-2">
          <div className="text-xs text-muted-foreground text-center">
            {goals.filter((g) => g.completed).length} of {goals.length} goals completed
          </div>

          {goals.some((g) => g.completed) && (
            <div className="text-xs text-muted-foreground text-center">
              💡 Completed goals are automatically removed after 24 hours
            </div>
          )}

          {goals.filter((g) => !g.completed).length === 0 && goals.length > 0 && (
            <div className="text-center">
              <div className="text-sm font-medium text-green-600 mb-1">🎉 All goals completed!</div>
              <div className="text-xs text-muted-foreground">
                Great job today! Add more goals or take a well-deserved break.
              </div>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
