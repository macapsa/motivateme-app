"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Mic, Star } from "lucide-react"

interface ElevenLabsSetupProps {
  onSetupComplete: (apiKey: string) => void
}

export function ElevenLabsSetup({ onSetupComplete }: ElevenLabsSetupProps) {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSetup = async () => {
    if (!apiKey.trim()) {
      alert("Please enter your ElevenLabs API key")
      return
    }

    if (!apiKey.startsWith("sk-")) {
      alert("ElevenLabs API keys should start with 'sk-'. Please check your key.")
      return
    }

    setIsLoading(true)
    try {
      // Test the API key with a simple models request first
      const testResponse = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Testing ElevenLabs integration",
          style: "calm",
          apiKey: apiKey,
        }),
      })

      const data = await testResponse.json()

      if (data.success) {
        onSetupComplete(apiKey)
      } else {
        let errorMessage = "Invalid API key. Please check and try again."
        if (data.status === 401) {
          errorMessage = "Invalid API key. Please verify your key from ElevenLabs dashboard."
        } else if (data.status === 402) {
          errorMessage = "Insufficient credits. Please check your ElevenLabs account balance."
        } else if (data.status === 429) {
          errorMessage = "Rate limit exceeded. Please try again in a moment."
        }
        alert(errorMessage)
      }
    } catch (error) {
      console.error("Setup error:", error)
      alert("Failed to test API key. Please check your internet connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-orange-600" />
          Upgrade to Premium AI Voices
        </CardTitle>
        <CardDescription>
          Get ultra-realistic voices including a perfect Sigourney Weaver-style voice for calm coaching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-orange-600" />
            <span>Natural human-like voices</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-orange-600" />
            <span>Perfect Sigourney Weaver style</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-orange-600" />
            <span>Professional quality audio</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
            <Button variant="outline" size="sm" asChild>
              <a href="https://elevenlabs.io/app/speech-synthesis" target="_blank" rel="noopener noreferrer">
                Get API Key <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
          <Input
            id="elevenlabs-key"
            type="password"
            placeholder="sk-your-api-key-here"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleSetup} disabled={!apiKey.trim() || isLoading} className="flex-1">
              {isLoading ? "Testing..." : "Enable Premium Voices"}
            </Button>
            <Button variant="outline" onClick={() => onSetupComplete("")}>
              Skip for Now
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• API key should start with "sk-"</p>
          <p>• Free tier includes 10,000 characters per month</p>
          <p>• Get premium voices including British Tony Robbins style</p>
          <p>• Your API key is stored locally and never shared</p>
        </div>
      </CardContent>
    </Card>
  )
}
