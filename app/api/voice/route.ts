import { type NextRequest, NextResponse } from "next/server"

// Fallback audio generation using Web Audio API for more natural-sounding tones
function generateNaturalTone(frequency: number, duration: number, volume: number): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    const sampleRate = 44100
    const samples = sampleRate * duration
    const buffer = new ArrayBuffer(samples * 2)
    const view = new DataView(buffer)

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      // Create a more complex waveform that sounds less robotic
      const fundamental = Math.sin(2 * Math.PI * frequency * t)
      const harmonic2 = 0.3 * Math.sin(2 * Math.PI * frequency * 2 * t)
      const harmonic3 = 0.1 * Math.sin(2 * Math.PI * frequency * 3 * t)

      // Add some natural variation
      const vibrato = 1 + 0.02 * Math.sin(2 * Math.PI * 5 * t)
      const envelope = Math.exp(-t * 0.5) // Natural decay

      const sample = (fundamental + harmonic2 + harmonic3) * vibrato * envelope * volume * 0.3
      const intSample = Math.max(-32767, Math.min(32767, sample * 32767))

      view.setInt16(i * 2, intSample, true)
    }

    resolve(buffer)
  })
}

export async function POST(request: NextRequest) {
  try {
    const { text, style } = await request.json()

    // For now, we'll create a more sophisticated fallback
    // In a real implementation, you would integrate with ElevenLabs or similar service

    // Create different audio characteristics for each style
    const styleSettings = {
      calm: {
        baseFrequency: 220, // Lower frequency for deeper voice
        duration: Math.max(3, text.length * 0.1), // Longer for calm delivery
        volume: 0.7,
      },
      energetic: {
        baseFrequency: 330,
        duration: Math.max(2, text.length * 0.05),
        volume: 0.9,
      },
      wise: {
        baseFrequency: 200,
        duration: Math.max(4, text.length * 0.12),
        volume: 0.8,
      },
    }

    const settings = styleSettings[style as keyof typeof styleSettings] || styleSettings.calm

    // Generate a more natural-sounding audio buffer
    const audioBuffer = await generateNaturalTone(settings.baseFrequency, settings.duration, settings.volume)

    // Convert to base64 for transmission
    const base64Audio = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      audioData: base64Audio,
      duration: settings.duration,
      style: style,
      message: "Audio generated successfully",
    })
  } catch (error) {
    console.error("Voice API error:", error)
    return NextResponse.json({ error: "Failed to generate voice audio" }, { status: 500 })
  }
}
