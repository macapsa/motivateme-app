import { type NextRequest, NextResponse } from "next/server"

// Curated daily inspiration messages
const inspirationalQuotes = [
  {
    quote:
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    author: "Steve Jobs",
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    quote: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
  },
  {
    quote: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
  },
  {
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
]

const personalizedMessages = {
  lowMood: [
    "Remember, every small step forward is progress. You don't have to climb the whole mountain today - just take the next step.",
    "Your current struggles are building your future strength. Be gentle with yourself as you navigate this challenging time.",
    "It's okay to have difficult days. What matters is that you're here, you're trying, and tomorrow is a fresh start.",
    "Sometimes the most productive thing you can do is rest. Honor where you are right now and trust in your resilience.",
  ],
  moderateMood: [
    "You're in a perfect position to make steady progress today. Trust in your ability to handle whatever comes your way.",
    "This balanced energy is your sweet spot for meaningful work. Focus on what truly matters to you right now.",
    "You have everything you need within you to succeed. Take confident steps toward your goals today.",
    "Your consistent effort is building something beautiful. Keep moving forward with purpose and intention.",
  ],
  highMood: [
    "Your positive energy is contagious! Use this momentum to tackle your biggest goals and inspire others around you.",
    "This is your time to shine! Channel this incredible energy into actions that align with your deepest values.",
    "You're operating at your peak today. What amazing things will you create with this powerful, focused energy?",
    "Your enthusiasm is your superpower today. Let it guide you toward meaningful achievements and joyful moments.",
  ],
}

export async function POST(request: NextRequest) {
  try {
    const { userName, mood } = await request.json()

    // Select random quote
    const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]

    // Determine mood category and select personalized message
    let moodCategory: "lowMood" | "moderateMood" | "highMood"
    if (mood < 33) {
      moodCategory = "lowMood"
    } else if (mood < 66) {
      moodCategory = "moderateMood"
    } else {
      moodCategory = "highMood"
    }

    const messages = personalizedMessages[moodCategory]
    const personalizedMessage = messages[Math.floor(Math.random() * messages.length)]

    // Create full message
    const greeting = userName && userName !== "there" ? `Good morning, ${userName}!` : "Good morning!"
    const fullMessage = `${greeting} ${personalizedMessage}`

    return NextResponse.json({
      message: fullMessage,
      quote: randomQuote.quote,
      author: randomQuote.author,
      date: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    })
  } catch (error) {
    console.error("Daily message API error:", error)
    return NextResponse.json({ error: "Failed to generate daily message" }, { status: 500 })
  }
}
