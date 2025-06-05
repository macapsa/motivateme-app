import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory user store for demo purposes
// In a real app, you'd use a database
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "demo123", // In real app, this would be hashed
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
