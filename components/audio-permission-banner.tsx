"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, X } from "lucide-react"

export function AudioPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Check if user has already granted audio permissions
    const hasAudioPermission = localStorage.getItem("audioPermissionGranted")
    if (!hasAudioPermission && !hasInteracted) {
      setShowBanner(true)
    }
  }, [hasInteracted])

  const enableAudio = async () => {
    try {
      // Test speech synthesis
      if ("speechSynthesis" in window) {
        const testUtterance = new SpeechSynthesisUtterance("Audio enabled")
        testUtterance.volume = 0.1
        speechSynthesis.speak(testUtterance)

        localStorage.setItem("audioPermissionGranted", "true")
        setShowBanner(false)
        setHasInteracted(true)
      }
    } catch (error) {
      console.error("Error enabling audio:", error)
    }
  }

  const dismissBanner = () => {
    setShowBanner(false)
    setHasInteracted(true)
    localStorage.setItem("audioPermissionDismissed", "true")
  }

  if (!showBanner) return null

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Enable Audio Coaching</p>
              <p className="text-xs text-muted-foreground">Click to enable text-to-speech for your coaching sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={enableAudio} className="bg-orange-600 hover:bg-orange-700">
              Enable Audio
            </Button>
            <Button variant="ghost" size="sm" onClick={dismissBanner}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
