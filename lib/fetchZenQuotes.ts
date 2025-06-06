// lib/fetchZenQuotes.ts

export async function fetchZenQuotes(): Promise<string[]> {
  const response = await fetch("/api/zen")

  if (!response.ok) {
    throw new Error("Failed to fetch Zen quotes")
  }

  const data = await response.json()
  return Array.isArray(data) ? data.filter(Boolean) : []
}
