import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://sheetsdb.io/api/v1/getsheet", {
      method: "POST",
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6Im1jYXBzYTg2QGdtYWlsLmNvbSIsIm5hbWUiOiJaZW5RdW90ZXMiLCJyZWZyZXNoQ291bnQiOjAsImNyZWF0ZWRPbiI6IjIwMjUtMDYtMDZUMTc6NDA6MjAuNTU3WiJ9.z5gbYwD-EJ8PB188Tc07riJtbP8yjNqjMwe3prfWsFA",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sheetRef: "1Vlw_tJ2BWHm9lb58Og4aw7DLGtZieQetXv2x1Jm_dZ4",
        hasHeader: true,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from SheetsDB" }, { status: 500 })
    }

    const data = await response.json()
    const quotes = data.map((row: { A: string }) => row.A).filter(Boolean)

    return NextResponse.json(quotes)
  } catch (error) {
    console.error("Zen API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
