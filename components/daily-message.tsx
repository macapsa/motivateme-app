"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2, Volume2, Pause, Star, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DailyMessageProps {
  userName?: string
}

interface DailyMessageData {
  message: string
  quote: string
  author: string
  date: string
}

export function DailyMessage({ userName = "there" }: DailyMessageProps) {
  const [dailyMessage, setDailyMessage] = useState<DailyMessageData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlayingInspiration, setIsPlayingInspiration] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [useElevenLabs, setUseElevenLabs] = useState(false)
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Check if ElevenLabs is enabled and API key exists
    const savedApiKey = localStorage.getItem("elevenLabsApiKey")
    const savedUseElevenLabs = localStorage.getItem("useElevenLabs")

    if (savedApiKey && savedApiKey.trim() && savedUseElevenLabs === "true") {
      setUseElevenLabs(true)
      setElevenLabsApiKey(savedApiKey)
    } else {
      setUseElevenLabs(false)
    }
  }, [])

  const generateDailyMessage = async () => {
    setIsLoading(true)
    try {
      // Get user's current mood
      const savedMood = localStorage.getItem("currentMood") || "50"

      const response = await fetch("/api/daily-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
          mood: Number.parseInt(savedMood),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDailyMessage(data)
        // Cache the message for today
        localStorage.setItem(
          "dailyMessage",
          JSON.stringify({
            ...data,
            generatedDate: new Date().toDateString(),
          }),
        )
      }
    } catch (error) {
      console.error("Error generating daily message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }
    if (currentUtterance) {
      speechSynthesis.cancel()
      setCurrentUtterance(null)
    }
    setIsPlayingInspiration(false)
    setIsLoadingAudio(false)
  }

  const playElevenLabsInspiration = async () => {
    if (!dailyMessage) return

    setIsLoadingAudio(true)
    stopAudio() // Stop any existing audio

    if (!useElevenLabs || !elevenLabsApiKey) {
      playFallbackInspiration()
      return
    }

    try {
      // Create the full inspiration text with enhanced natural pauses and emphasis
      let fullText = `Good morning. ${dailyMessage.message}`

      // Add natural breathing pauses
      fullText = fullText.replace(/\./g, "... ").replace(/,/g, ", ")

      // Add the quote with proper emphasis
      fullText += `... Here's something to reflect on: "${dailyMessage.quote}"... This wisdom comes from ${dailyMessage.author}.`

      // Add a gentle closing
      fullText += "... Take a moment to let this inspire your day."

      const response = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: fullText,
          style: "inspiration", // New dedicated style for inspiration
          apiKey: elevenLabsApiKey,
        }),
      })

      const data = await response.json()

      if (data.success && data.audioData) {
        // Create audio from base64 data
        const audioBlob = new Blob([Uint8Array.from(atob(data.audioData), (c) => c.charCodeAt(0))], {
          type: "audio/mpeg",
        })
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        audio.volume = 0.8
        setCurrentAudio(audio)

        audio.onloadstart = () => {
          setIsLoadingAudio(false)
          setIsPlayingInspiration(true)
        }

        audio.onended = () => {
          setIsPlayingInspiration(false)
          URL.revokeObjectURL(audioUrl)
          setCurrentAudio(null)
        }

        audio.onerror = (error) => {
          console.error("Audio playback error:", error)
          setIsPlayingInspiration(false)
          setIsLoadingAudio(false)
          toast({
            title: "Audio Error",
            description: "Failed to play ElevenLabs audio. Falling back to browser speech.",
            variant: "destructive",
          })
          playFallbackInspiration()
        }

        await audio.play()

        toast({
          title: "Ultra-Natural Inspiration",
          description: "Playing with Bella - premium inspirational voice",
        })
      } else if (data.fallback) {
        // Fallback to browser speech synthesis
        setIsLoadingAudio(false)
        toast({
          title: "Using Fallback",
          description: data.message || "Using browser speech synthesis",
        })
        playFallbackInspiration()
      } else {
        throw new Error(data.error || "Failed to generate audio")
      }
    } catch (error) {
      console.error("ElevenLabs audio error:", error)
      setIsLoadingAudio(false)
      toast({
        title: "Audio Error",
        description: "Failed to generate ElevenLabs audio. Using fallback.",
        variant: "destructive",
      })
      playFallbackInspiration()
    }
  }

  const playFallbackInspiration = () => {
    if (!dailyMessage) return

    if ("speechSynthesis" in window) {
      speechSynthesis.cancel() // Clear any existing speech

      // Create the full inspiration text
      const fullText = `${dailyMessage.message} ${dailyMessage.quote} by ${dailyMessage.author}`

      const utterance = new SpeechSynthesisUtterance(fullText)

      // Configure voice settings for inspiration
      const voices = speechSynthesis.getVoices()
      const inspirationVoice =
        voices.find(
          (v) =>
            v.lang.includes("en") &&
            (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("karen")),
        ) || voices[0]

      utterance.voice = inspirationVoice
      utterance.rate = 0.85 // Slightly slower for contemplative delivery
      utterance.pitch = 0.9 // Slightly lower pitch for warmth
      utterance.volume = 0.8

      utterance.onstart = () => {
        setIsPlayingInspiration(true)
        setIsLoadingAudio(false)
      }

      utterance.onend = () => {
        setIsPlayingInspiration(false)
        setCurrentUtterance(null)
      }

      utterance.onerror = () => {
        setIsPlayingInspiration(false)
        setCurrentUtterance(null)
        setIsLoadingAudio(false)
      }

      setCurrentUtterance(utterance)
      speechSynthesis.speak(utterance)
    }
  }

  const playInspiration = () => {
    if (isPlayingInspiration) {
      stopAudio()
      return
    }

    // If no daily message, use a default inspirational message
    if (!dailyMessage) {
      const defaultMessage = {
        message:
          "Today is a new opportunity to grow, learn, and become the best version of yourself. Embrace the challenges and celebrate the victories, no matter how small.",
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
      }

      // Temporarily set this as the daily message for audio playback
      setDailyMessage(defaultMessage)

      // Use a timeout to ensure the state is updated before playing
      setTimeout(() => {
        if (useElevenLabs && elevenLabsApiKey) {
          playElevenLabsInspiration()
        } else {
          playFallbackInspiration()
        }
      }, 100)
      return
    }

    if (useElevenLabs && elevenLabsApiKey) {
      playElevenLabsInspiration()
    } else {
      playFallbackInspiration()
    }
  }

  useEffect(() => {
    // Check if we already have a message for today
    const cachedMessage = localStorage.getItem("dailyMessage")
    if (cachedMessage) {
      const parsed = JSON.parse(cachedMessage)
      const today = new Date().toDateString()

      if (parsed.generatedDate === today) {
        setDailyMessage(parsed)
        return
      }
    }

    // Always generate a message on component mount
    generateDailyMessage()
  }, []) // Remove userName dependency to ensure it always runs

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  return (
    <Card className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Your Daily Inspiration
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={playInspiration}
              disabled={isLoadingAudio} // Remove the !dailyMessage condition
              className="flex items-center gap-1"
            >
              {isLoadingAudio ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Loading...</span>
                </>
              ) : isPlayingInspiration ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  {useElevenLabs && elevenLabsApiKey ? (
                    <Star className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Inspire</span>
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={generateDailyMessage} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {dailyMessage?.date ||
            new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Generating your personalized message...</span>
          </div>
        ) : dailyMessage ? (
          <div className="space-y-4">
            <blockquote className="border-l-2 border-purple-600 pl-4 italic">"{dailyMessage.quote}"</blockquote>
            <p className="text-right text-sm text-muted-foreground">— {dailyMessage.author}</p>
            <p className="text-sm leading-relaxed">{dailyMessage.message}</p>
            <p className="text-xs text-muted-foreground">
              💡 This message was personalized based on your current mood and goals
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <blockquote className="border-l-2 border-purple-600 pl-4 italic">
              "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't
              settle."
            </blockquote>
            <p className="text-right text-sm text-muted-foreground">— Steve Jobs</p>
            <p className="text-sm">
              Good morning, {userName}! Today, focus on finding joy in your tasks. Even the smallest achievements
              deserve celebration.
            </p>
          </div>
        )}
        {isPlayingInspiration && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-purple-600 dark:text-purple-400">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
            <span>
              {useElevenLabs && elevenLabsApiKey
                ? "Playing premium inspiration with Bella voice..."
                : "Reading your daily inspiration..."}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
