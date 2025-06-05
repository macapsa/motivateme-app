import { type NextRequest, NextResponse } from "next/server"

// Fallback coaching messages organized by style
const coachingMessages = {
  calm: {
    greeting: "Take a deep breath with me",
    lowMood: [
      "It's okay to feel this way. Let's start with just one small, gentle step forward. Remember, healing happens in quiet moments of self-compassion.",
      "Your feelings are valid, and this moment will pass. Focus on your breath - inhale peace, exhale tension. You're stronger than you know.",
      "Sometimes the most courageous thing is to simply be present with yourself. Take it slow today, one mindful moment at a time.",
    ],
    moderateMood: [
      "You're finding your balance today. Trust in your ability to navigate whatever comes your way with grace and wisdom.",
      "This steady energy is perfect for mindful progress. Set an intention for today and let it guide you gently forward.",
      "You're in a beautiful space of calm awareness. Use this clarity to focus on what truly matters to you right now.",
    ],
    highMood: [
      "Your positive energy is radiant today. Channel this beautiful momentum into meaningful actions that align with your values.",
      "What a wonderful day to practice gratitude and share your light with others. Your calm confidence is inspiring.",
      "This is the perfect time for creative thinking and peaceful productivity. Trust your intuition to guide you.",
    ],
  },
  energetic: {
    greeting: "LET'S GO! Time to CRUSH today!",
    lowMood: [
      "Hey champion! Even the strongest warriors need rest days. But you know what? You're STILL here, you're STILL fighting, and that makes you INCREDIBLE!",
      "Listen up, superstar! Low energy doesn't mean low potential. You've got FIRE inside you - let's start with ONE small win and build from there!",
      "BOOM! You showed up today, and that's already a VICTORY! Every small step forward is you CRUSHING your comfort zone. Let's DO this!",
    ],
    moderateMood: [
      "YES! You're in the PERFECT zone to make things happen! This steady energy is your secret weapon - use it to DOMINATE your goals!",
      "AMAZING! You're locked and loaded for SUCCESS today! Channel this focused energy into ACTION and watch yourself SOAR!",
      "FANTASTIC! You're riding the perfect wave of motivation. Time to turn that energy into RESULTS! What's your first BIG move?",
    ],
    highMood: [
      "UNSTOPPABLE! You're absolutely ON FIRE today! This is YOUR moment to SHINE and show the world what you're made of!",
      "INCREDIBLE! Your energy is ELECTRIC! Use this POWER to tackle your biggest challenges and SMASH through every barrier!",
      "PHENOMENAL! You're operating at PEAK performance! Nothing can stop you when you're in this zone - go CONQUER your dreams!",
    ],
  },
  wise: {
    greeting: "Wisdom comes through experience and reflection",
    lowMood: [
      "In the depths of winter, I finally learned that within me there lay an invincible summer. Your current struggle is forging your future strength.",
      "The oak tree that withstands the storm grows stronger roots. What feels like setback today is tomorrow's foundation for growth.",
      "Even the mightiest river flows around obstacles, not through them. What can you learn from water's patient persistence?",
    ],
    moderateMood: [
      "Balance is not something you find, but something you create. You're walking the middle path with wisdom and grace today.",
      "The master gardener knows that steady, consistent care yields the most beautiful gardens. Your patience will bear fruit.",
      "True strength lies not in the absence of struggle, but in the quiet confidence to face whatever comes. You embody this wisdom.",
    ],
    highMood: [
      "When the student is ready, the teacher appears. Your elevated spirit today is both student and teacher - what will you learn and share?",
      "The mountain peak offers the clearest view, but remember - the journey up taught you everything you needed to know.",
      "Your energy today is like the sun at noon - powerful and illuminating. Use this clarity to see the path ahead with wisdom.",
    ],
  },
}

export async function POST(request: NextRequest) {
  try {
    const { style, mood, userName } = await request.json()

    const selectedStyle = coachingMessages[style as keyof typeof coachingMessages]

    if (!selectedStyle) {
      return NextResponse.json({ error: "Invalid coaching style" }, { status: 400 })
    }

    // Determine mood category
    let moodCategory: "lowMood" | "moderateMood" | "highMood"
    if (mood < 33) {
      moodCategory = "lowMood"
    } else if (mood < 66) {
      moodCategory = "moderateMood"
    } else {
      moodCategory = "highMood"
    }

    // Get random message from appropriate category
    const messages = selectedStyle[moodCategory]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    // Personalize the message with user's name
    const personalizedMessage =
      userName && userName !== "there"
        ? randomMessage.replace(/\b(you|You)\b/g, userName).replace(/\byour\b/g, `${userName}'s`)
        : randomMessage

    return NextResponse.json({
      message: personalizedMessage,
      greeting: selectedStyle.greeting,
      style: style,
    })
  } catch (error) {
    console.error("Coaching API error:", error)
    return NextResponse.json({ error: "Failed to generate coaching message" }, { status: 500 })
  }
}
