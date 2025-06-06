'use client'

import { quotes } from "@/lib/quotes"
import { Mic } from "lucide-react"
import { useEffect, useState } from "react"

const quoteIndexKey = 'currentQuoteIndex'
const favoritesKey = 'favoriteQuotes'

export default function InspireCard() {
  const [quote, setQuote] = useState("")
  const [index, setIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const storedIndex = parseInt(localStorage.getItem(quoteIndexKey) || '0')
    setIndex(storedIndex)
    const current = quotes[storedIndex % quotes.length]
    setQuote(current)
    setIsFavorite(getFavorites().includes(current))
  }, [])

  const handleInspireClick = () => {
    const newIndex = (index + 1) % quotes.length
    localStorage.setItem(quoteIndexKey, newIndex.toString())
    setIndex(newIndex)
    const newQuote = quotes[newIndex]
    setQuote(newQuote)
    setIsFavorite(getFavorites().includes(newQuote))
  }

  const toggleFavorite = () => {
    const favs = getFavorites()
    const updated = favs.includes(quote)
      ? favs.filter(q => q !== quote)
      : [...favs, quote]
    localStorage.setItem(favoritesKey, JSON.stringify(updated))
    setIsFavorite(updated.includes(quote))
  }

  const getFavorites = (): string[] =>
    JSON.parse(localStorage.getItem(favoritesKey) || '[]')

  const speakQuote = () => {
  if (typeof window !== 'undefined') {
    const utterance = new SpeechSynthesisUtterance(quote)
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(voice =>
      voice.name.toLowerCase().includes("english") &&
      voice.lang.toLowerCase().includes("en") &&
      voice.name.toLowerCase().includes("Male")
    ) || voices.find(voice =>
      voice.lang.toLowerCase().includes("en-gb") &&
      voice.name.toLowerCase().includes("google") // fallback to Google American Male if available
    )

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.pitch = 2.0
    utterance.rate = 0.90
    speechSynthesis.speak(utterance)
  }
}

  return (
    <div className="text-center p-6 space-y-4 bg-muted rounded-lg">
      {/* Top banner row */}
      <div className="flex justify-end text-sm text-muted-foreground">
        <button onClick={speakQuote} className="flex items-center gap-1 hover:text-foreground">
          <Mic className="h-4 w-4" />
          Inspire
        </button>
      </div>

      {/* Quote */}
      <blockquote className="text-xl italic font-medium text-muted-foreground mb-2">
        "{quote}"
      </blockquote>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleInspireClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Inspire Me Again
        </button>
        <button
          onClick={toggleFavorite}
          className="text-2xl"
          aria-label="Toggle favorite"
        >
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>
    </div>
  )
}
