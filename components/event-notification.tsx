"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, X, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface EventNotificationProps {
  event: {
    id: number
    title: string
    description?: string
    time: string
  }
  onDismiss: () => void
  onComplete?: () => void
}

export function EventNotification({ event, onDismiss, onComplete }: EventNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(30) // 30 seconds auto-dismiss

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDismiss()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.9 }}
      className="fixed top-4 right-4 z-50 w-80"
    >
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500 rounded-full animate-pulse">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">⏰ {event.title}</h3>
                <p className="text-sm text-orange-700 dark:text-orange-200">{event.time}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {event.description && (
            <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">{event.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="sm" onClick={onDismiss} className="bg-orange-500 hover:bg-orange-600 text-white">
                Got it!
              </Button>
              {onComplete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onComplete()
                    onDismiss()
                  }}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark Done
                </Button>
              )}
            </div>
            <span className="text-xs text-orange-600">Auto-dismiss in {timeLeft}s</span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 w-full bg-orange-200 rounded-full h-1">
            <motion.div
              className="bg-orange-500 h-1 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 30, ease: "linear" }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
