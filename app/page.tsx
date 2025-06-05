"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Calendar, Headphones, MessageSquare } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/images/motivateme-logo.png" alt="MotivateME Logo" width={32} height={32} className="w-8 h-8" />
          <span className="font-bold text-xl">MotivateME</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-orange-50 via-purple-50 to-white dark:from-gray-900 dark:via-orange-900/10 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              {/* Hero Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full blur-3xl opacity-20 scale-150 animate-pulse"></div>
                <Image
                  src="/images/motivateme-logo.png"
                  alt="MotivateME - Your Personal Motivation Coach"
                  width={200}
                  height={200}
                  className="relative z-10 w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 drop-shadow-2xl"
                  priority
                />
              </div>

              <div className="space-y-4 max-w-4xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-orange-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                  Your Personal Motivation Coach
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300 leading-relaxed">
                  Stay motivated, focused, and believe in yourself with personalized coaching, goal tracking, and daily
                  inspiration powered by AI.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  asChild
                >
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                  onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features-section" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                    Features Designed to Help You Thrive
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Our app combines personalized coaching, goal setting, and habit tracking to help you stay motivated
                    and focused on what matters most.
                  </p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col items-center space-y-2 border rounded-xl p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">Audio Coaching</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    Choose from calm, energetic, or wise coaching styles with premium AI voices to match your mood and
                    needs.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">Mood Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    Track your emotional state and receive personalized content based on how you feel each day.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Goal Setting</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    Set daily, weekly, and long-term goals with smart reminders and visual progress tracking.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100">Daily Inspiration</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    Receive personalized messages and affirmations to start your day with positivity and purpose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-orange-500 via-purple-600 to-orange-500">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center text-white">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Life?
                </h2>
                <p className="mx-auto max-w-[600px] text-orange-100 md:text-xl">
                  Join thousands of people who are already achieving their goals with MotivateME.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  asChild
                >
                  <Link href="/signup">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/signup">Watch Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Image src="/images/motivateme-logo.png" alt="MotivateME" width={20} height={20} className="w-5 h-5" />
          <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 MotivateME. All rights reserved.</p>
        </div>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
