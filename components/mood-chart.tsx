"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Calendar, BarChart3 } from "lucide-react"

interface MoodEntry {
  date: string
  mood: number
  timestamp: number
}

export function MoodChart() {
  const [moodData, setMoodData] = useState<MoodEntry[]>([])
  const [averageMood, setAverageMood] = useState(0)
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable")

  useEffect(() => {
    loadMoodHistory()
  }, [])

  const loadMoodHistory = () => {
    const savedMoodHistory = localStorage.getItem("moodHistory")
    if (savedMoodHistory) {
      const history: MoodEntry[] = JSON.parse(savedMoodHistory)

      // Sort by timestamp to ensure proper order
      const sortedHistory = history.sort((a, b) => a.timestamp - b.timestamp)

      // Only show last 30 days for better visualization
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      const recentHistory = sortedHistory.filter((entry) => entry.timestamp > thirtyDaysAgo)

      setMoodData(recentHistory)

      // Calculate average mood
      if (recentHistory.length > 0) {
        const avg = recentHistory.reduce((sum, entry) => sum + entry.mood, 0) / recentHistory.length
        setAverageMood(Math.round(avg))

        // Calculate trend (compare first half vs second half)
        if (recentHistory.length >= 4) {
          const midPoint = Math.floor(recentHistory.length / 2)
          const firstHalf = recentHistory.slice(0, midPoint)
          const secondHalf = recentHistory.slice(midPoint)

          const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.mood, 0) / firstHalf.length
          const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.mood, 0) / secondHalf.length

          const difference = secondAvg - firstAvg
          if (difference > 5) setTrend("up")
          else if (difference < -5) setTrend("down")
          else setTrend("stable")
        }
      }
    }
  }

  const getMoodLabel = (mood: number) => {
    if (mood < 33) return "Low Energy"
    if (mood < 66) return "Moderate Energy"
    return "High Energy"
  }

  const getMoodColor = (mood: number) => {
    if (mood < 33) return "#ef4444" // red
    if (mood < 66) return "#f59e0b" // amber
    return "#10b981" // green
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default:
        return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  const getTrendText = () => {
    switch (trend) {
      case "up":
        return "Trending upward"
      case "down":
        return "Trending downward"
      default:
        return "Stable trend"
    }
  }

  // Format data for the chart
  const chartData = moodData.map((entry, index) => ({
    ...entry,
    day: `Day ${index + 1}`,
    displayDate: new Date(entry.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Mood Tracking
        </CardTitle>
        <CardDescription>Your energy levels over the past 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {moodData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No mood data yet</h3>
            <p className="text-sm text-muted-foreground">Start tracking your mood to see your progress over time</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMoodColor(averageMood) }} />
                  <span className="text-sm font-medium">Average Mood</span>
                </div>
                <p className="text-lg font-bold mt-1">{getMoodLabel(averageMood)}</p>
                <p className="text-xs text-muted-foreground">{averageMood}/100</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  {getTrendIcon()}
                  <span className="text-sm font-medium">Trend</span>
                </div>
                <p className="text-lg font-bold mt-1">{getTrendText()}</p>
                <p className="text-xs text-muted-foreground">Last {moodData.length} entries</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-purple-600" />
                  <span className="text-sm font-medium">Entries</span>
                </div>
                <p className="text-lg font-bold mt-1">{moodData.length}</p>
                <p className="text-xs text-muted-foreground">Past 30 days</p>
              </div>
            </div>

            {/* Chart */}
            <ChartContainer
              config={{
                mood: {
                  label: "Energy Level",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [`${value} - ${getMoodLabel(value)}`, "Energy Level"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="var(--color-mood)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-mood)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "var(--color-mood)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Recent Entries */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Entries</h4>
              <div className="space-y-1">
                {moodData
                  .slice(-5)
                  .reverse()
                  .map((entry, index) => (
                    <div key={entry.timestamp} className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getMoodColor(entry.mood) }} />
                        <span className="text-sm font-medium">{getMoodLabel(entry.mood)}</span>
                        <span className="text-xs text-muted-foreground">({entry.mood})</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
