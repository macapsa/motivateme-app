"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const totalSteps = 4
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    i + 1 === step
                      ? "border-purple-600 bg-purple-600 text-white"
                      : i + 1 < step
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-gray-300 bg-white text-gray-500"
                  }`}
                >
                  {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && <div className={`h-1 w-16 ${i + 1 < step ? "bg-purple-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Tell us about yourself</CardTitle>
                <CardDescription>This helps us personalize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">What should we call you?</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label>What are you primarily looking to improve?</Label>
                  <RadioGroup defaultValue="motivation">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="motivation" id="motivation" />
                      <Label htmlFor="motivation">Daily motivation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="focus" id="focus" />
                      <Label htmlFor="focus">Focus and productivity</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="confidence" id="confidence" />
                      <Label htmlFor="confidence">Self-confidence</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="habits" id="habits" />
                      <Label htmlFor="habits">Building better habits</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Your goals</CardTitle>
                <CardDescription>What would you like to achieve?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>What type of goals are you focusing on?</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="personal" />
                      <label
                        htmlFor="personal"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Personal development
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="career" />
                      <label
                        htmlFor="career"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Career growth
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="health" />
                      <label
                        htmlFor="health"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Health and fitness
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="relationships" />
                      <label
                        htmlFor="relationships"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Relationships
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeframe">What's your timeframe?</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily goals</SelectItem>
                      <SelectItem value="weekly">Weekly goals</SelectItem>
                      <SelectItem value="monthly">Monthly goals</SelectItem>
                      <SelectItem value="quarterly">Quarterly goals</SelectItem>
                      <SelectItem value="yearly">Yearly goals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Coaching preferences</CardTitle>
                <CardDescription>How would you like to be coached?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>What coaching style resonates with you?</Label>
                  <RadioGroup defaultValue="calm">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="calm" id="calm" />
                      <Label htmlFor="calm">Calm, reassuring therapist</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="energetic" id="energetic" />
                      <Label htmlFor="energetic">Loud, energetic motivational</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wise" id="wise" />
                      <Label htmlFor="wise">Wise mentor with deep insights</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>When do you prefer to receive notifications?</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6am - 9am)</SelectItem>
                      <SelectItem value="midday">Midday (11am - 1pm)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (3pm - 5pm)</SelectItem>
                      <SelectItem value="evening">Evening (7pm - 9pm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>You're all set!</CardTitle>
                <CardDescription>We've personalized your experience based on your preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="mx-auto my-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">Ready to get started</h3>
                  <p className="text-sm text-muted-foreground">
                    Your personalized motivation and focus journey begins now. We'll help you stay on track and achieve
                    your goals.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button className="ml-auto bg-purple-600 hover:bg-purple-700" onClick={nextStep}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button className="ml-auto bg-purple-600 hover:bg-purple-700" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
