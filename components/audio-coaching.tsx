"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { fetchZenQuotes } from "@/lib/fetchZenQuotes"
import { Headphones, Loader2, Pause, Play, RefreshCw, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { useEffect, useState } from "react"

interface CoachingResponse {
  message: string
  greeting: string
  style: string
}

export function AudioCoaching() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [currentStyle, setCurrentStyle] = useState("calm")
  const [coachingMessage, setCoachingMessage] = useState<CoachingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userMood, setUserMood] = useState(50)
  const [userName, setUserName] = useState("")
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setUserName(user.name)
    }
    const savedMood = localStorage.getItem("currentMood")
    if (savedMood) {
      setUserMood(Number.parseInt(savedMood))
    }
  }, [])

  const generateCoachingMessage = async (style: string) => {
    setIsLoading(true)
    try {
      if (style === "calm") {
        const quotes = await fetchZenQuotes()
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
        setCoachingMessage({
          greeting: "Take a deep breath with me",
          message: randomQuote,
          style: "calm",
        })
        stopAudio()
      } else {
        const response = await fetch("/api/coaching", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ style, mood: userMood, userName }),
        })
        if (response.ok) {
          const data = await response.json()
          setCoachingMessage(data)
          stopAudio()
        }
      }
    } catch (error) {
      console.error("Error generating coaching message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = () => {
    if (!coachingMessage) return
    stopAudio()
    if ("speechSynthesis" in window) {
      const fullText = `${coachingMessage.greeting}. ${coachingMessage.message}`
      const utterance = new SpeechSynthesisUtterance(fullText)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = volume / 100
      utterance.onstart = () => {
        setIsPlaying(true)
        setIsLoadingAudio(false)
      }
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      speechSynthesis.speak(utterance)
    }
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }
    if ("speechSynthesis" in window) speechSynthesis.cancel()
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    if (isPlaying) stopAudio()
    else playAudio()
  }

  const handleStyleChange = (style: string) => {
    stopAudio()
    setCurrentStyle(style)
    generateCoachingMessage(style)
  }

  const handleRefresh = () => {
    stopAudio()
    generateCoachingMessage(currentStyle)
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0])
    if (currentAudio) currentAudio.volume = newVolume[0] / 100
  }

  useEffect(() => {
    if (userName) generateCoachingMessage(currentStyle)
  }, [userName])

  useEffect(() => {
    return () => stopAudio()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-purple-600" />
            Choose your path
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={currentStyle} onValueChange={handleStyleChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calm">Zen</TabsTrigger>
            <TabsTrigger value="energetic">Hype</TabsTrigger>
            <TabsTrigger value="wise">Wisdom</TabsTrigger>
          </TabsList>

          {["calm", "energetic", "wise"].map((style) => (
            <TabsContent key={style} value={style} className="space-y-4 pt-4">
              <div className="rounded-lg p-4 border bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating personalized message...
                  </div>
                ) : coachingMessage && coachingMessage.style === style ? (
                  <div className="space-y-2">
                    <p className="text-sm italic">"{coachingMessage.message}"</p>
                  </div>
                ) : null}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="space-y-4">
          <div className="flex justify-center items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700"
              onClick={handlePlayPause}
              disabled={!coachingMessage || isLoadingAudio}
            >
              {isLoadingAudio ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={() => generateCoachingMessage(currentStyle)}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider value={[volume]} min={0} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1" />
            <span className="text-xs text-muted-foreground w-8">{volume}%</span>
          </div>

          {isPlaying && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                Now playing: {currentStyle} coaching
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
