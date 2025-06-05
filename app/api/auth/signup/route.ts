import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory user store for demo purposes
// In a real app, you'd use a database
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "demo123",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In real app, this would be hashed
    }

    users.push(newUser)

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({
      user: userWithoutPassword,
      message: "Account created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
