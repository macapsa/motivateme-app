"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Headphones, Play, Pause, SkipBack, SkipForward, Volume2, Loader2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

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
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setUserName(user.name)
    }

    // Get mood from localStorage if available
    const savedMood = localStorage.getItem("currentMood")
    if (savedMood) {
      setUserMood(Number.parseInt(savedMood))
    }
  }, [])

  const generateCoachingMessage = async (style: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/coaching", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          style,
          mood: userMood,
          userName,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCoachingMessage(data)
        stopAudio()
      } else {
        console.error("Failed to generate coaching message")
      }
    } catch (error) {
      console.error("Error generating coaching message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const playElevenLabsAudio = async () => {
    if (!coachingMessage) return

    setIsLoadingAudio(true)

    // Get API key from localStorage only once during component initialization
    const savedApiKey = localStorage.getItem("elevenLabsApiKey")
    const savedUseElevenLabs = localStorage.getItem("useElevenLabs")

    if (!savedApiKey || savedUseElevenLabs !== "true") {
      playFallbackAudio()
      return
    }

    try {
      // Add natural pauses and emphasis for more human-like speech
      let fullText = `${coachingMessage.greeting}. ${coachingMessage.message}`

      // Add SSML-like markers that ElevenLabs can interpret for more natural speech
      if (currentStyle === "calm") {
        // Add pauses and softer tone for calm style
        fullText = fullText.replace(/\./g, "... ").replace(/,/g, ", ")
      } else if (currentStyle === "energetic") {
        // Add emphasis for energetic style
        fullText = fullText.replace(/!/g, "! ").replace(/\?/g, "? ")
      }

      const response = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: fullText,
          style: currentStyle,
          apiKey: savedApiKey,
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

        audio.volume = volume / 100
        setCurrentAudio(audio)

        audio.onloadstart = () => {
          setIsLoadingAudio(false)
          setIsPlaying(true)
        }

        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
          setCurrentAudio(null)
        }

        audio.onerror = (error) => {
          console.error("Audio playback error:", error)
          setIsPlaying(false)
          setIsLoadingAudio(false)
          toast({
            title: "Audio Error",
            description: "Failed to play ElevenLabs audio. Falling back to browser speech.",
            variant: "destructive",
          })
          playFallbackAudio()
        }

        await audio.play()

        toast({
          title: "ElevenLabs Premium Voice",
          description: `Playing ${currentStyle} coaching`,
        })
      } else if (data.fallback) {
        // Fallback to browser speech synthesis
        setIsLoadingAudio(false)
        toast({
          title: "Using Fallback",
          description: data.message || "Using browser speech synthesis",
        })
        playFallbackAudio()
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
      playFallbackAudio()
    }
  }

  const playFallbackAudio = async () => {
    if (!coachingMessage) return

    try {
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel()

        const fullText = `${coachingMessage.greeting}. ${coachingMessage.message}`
        const utterance = new SpeechSynthesisUtterance(fullText)

        const voiceSettings = getEnhancedVoiceSettings(currentStyle)
        utterance.rate = voiceSettings.rate
        utterance.pitch = voiceSettings.pitch
        utterance.volume = volume / 100
        utterance.voice = voiceSettings.voice

        if (currentStyle === "calm") {
          const enhancedText = fullText.replace(/\./g, "... ").replace(/,/g, ", ").replace(/\?/g, "?... ")
          utterance.text = enhancedText
        }

        utterance.onstart = () => {
          setIsPlaying(true)
          setIsLoadingAudio(false)
        }

        utterance.onend = () => {
          setIsPlaying(false)
        }

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event)
          setIsPlaying(false)
          setIsLoadingAudio(false)
        }

        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error("Fallback audio error:", error)
      setIsLoadingAudio(false)
    }
  }

  const getEnhancedVoiceSettings = (style: string) => {
    const voices = speechSynthesis.getVoices()

    switch (style) {
      case "calm":
        const calmVoice =
          voices.find((v) => {
            const name = v.name.toLowerCase()
            const lang = v.lang.toLowerCase()
            return (
              (name.includes("premium") && name.includes("female") && lang.includes("en")) ||
              (name.includes("neural") && name.includes("female") && lang.includes("en")) ||
              (name.includes("karen") && lang.includes("en")) ||
              (name.includes("moira") && lang.includes("en")) ||
              (name.includes("fiona") && lang.includes("en"))
            )
          }) ||
          voices.find((v) => v.lang.includes("en") && v.name.toLowerCase().includes("female")) ||
          voices[0]

        return {
          rate: 0.65,
          pitch: 0.6,
          voice: calmVoice,
        }
      case "energetic":
        const energeticVoice =
          voices.find((v) => {
            const name = v.name.toLowerCase()
            const lang = v.lang.toLowerCase()
            return (
              (lang.includes("en-gb") && name.includes("male")) ||
              (name.includes("british") && name.includes("male")) ||
              (name.includes("uk") && name.includes("male"))
            )
          }) ||
          voices.find((v) => v.name.includes("Male") || v.name.includes("Alex")) ||
          voices[1] ||
          voices[0]

        return {
          rate: 1.4,
          pitch: 1.1,
          voice: energeticVoice,
        }
      case "wise":
        return {
          rate: 0.8,
          pitch: 0.7,
          voice: voices.find((v) => v.name.includes("Male") && v.lang.includes("en")) || voices[1] || voices[0],
        }
      default:
        return {
          rate: 1.0,
          pitch: 1.0,
          voice: voices[0],
        }
    }
  }

  const playCoachingAudio = async () => {
    if (!coachingMessage) return

    const savedApiKey = localStorage.getItem("elevenLabsApiKey")
    const savedUseElevenLabs = localStorage.getItem("useElevenLabs")

    if (savedUseElevenLabs === "true" && savedApiKey) {
      await playElevenLabsAudio()
    } else {
      await playFallbackAudio()
    }
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAudio()
    } else {
      playCoachingAudio()
    }
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
    if (currentAudio) {
      currentAudio.volume = newVolume[0] / 100
    }
  }

  // Generate initial message
  useEffect(() => {
    if (userName) {
      generateCoachingMessage(currentStyle)
    }
  }, [userName])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio()
    }
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

          <TabsContent value="calm" className="space-y-4 pt-4">
            <div className="rounded-lg p-4 border bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating personalized message...
                </div>
              ) : coachingMessage && coachingMessage.style === "calm" ? (
                <div className="space-y-2">
                  <p className="text-sm italic">"{coachingMessage.message}"</p>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="energetic" className="space-y-4 pt-4">
            <div className="rounded-lg p-4 border bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating personalized message...
                </div>
              ) : coachingMessage && coachingMessage.style === "energetic" ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">"{coachingMessage.message}"</p>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="wise" className="space-y-4 pt-4">
            <div className="rounded-lg p-4 border bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating personalized message...
                </div>
              ) : coachingMessage && coachingMessage.style === "wise" ? (
                <div className="space-y-2">
                  <p className="text-sm italic">"{coachingMessage.message}"</p>
                </div>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="flex justify-center items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => handleRefresh()}>
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
