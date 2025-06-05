import { type NextRequest, NextResponse } from "next/server"

// ElevenLabs premium voice IDs for more natural, human-like voices
const VOICE_IDS = {
  // Premium voices with high naturalness
  calm: "pNInz6obpgDQGcFmaJgB", // Nicole - Warm, natural female voice with Sigourney-like authority
  energetic: "nPczCjzI2devNBz1zQrb", // Brian - Professional narrator from Best for English section
  wise: "ThT5KcBeYPX3keUQqHPh", // Arnold - Deep, wise male voice with natural gravitas
  inspiration: "EXAVITQu4vr4xnSDxMaL", // Bella - Ultra-natural female voice perfect for inspiration
}

// Backup premium voices if the above don't work well
const ALTERNATIVE_VOICES = {
  calm: "21m00Tcm4TlvDq8ikWAM", // Rachel - Professional female voice
  energetic: "D38z5RcWu1voky8WS1ja", // Liam - Alternative male voice with energy
  wise: "CYw3kZ02Hs0563khs1Fj", // Dave - Thoughtful male voice
  inspiration: "pNInz6obpgDQGcFmaJgB", // Nicole as backup for inspiration
}

export async function POST(request: NextRequest) {
  try {
    const { text, style, apiKey: apiKeyParam } = await request.json()

    // Use provided API key or environment variable
    const apiKey = apiKeyParam || process.env.ELEVENLABS_API_KEY

    // Validate API key
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "ElevenLabs API key required",
          fallback: true,
          message: "Please provide an ElevenLabs API key to use premium voices",
        },
        { status: 400 },
      )
    }

    const voiceId = VOICE_IDS[style as keyof typeof VOICE_IDS] || VOICE_IDS.calm

    // Enhanced voice settings for maximum naturalness
    const voiceSettings = {
      calm: {
        stability: 0.71, // Balanced for natural variation while maintaining character
        similarity_boost: 0.85, // Strong character consistency
        style: 0.35, // Moderate style for natural expression
        use_speaker_boost: true,
      },
      energetic: {
        stability: 0.6, // Slightly higher for Brian's professional delivery
        similarity_boost: 0.8, // Good similarity for consistent narrator quality
        style: 0.7, // Higher style for more expressive, motivational delivery
        use_speaker_boost: true,
      },
      wise: {
        stability: 0.65, // Balanced for natural wisdom
        similarity_boost: 0.8, // Good similarity for consistent character
        style: 0.45, // Moderate style for natural wisdom
        use_speaker_boost: true,
      },
      inspiration: {
        stability: 0.75, // Higher stability for smooth, flowing inspiration
        similarity_boost: 0.9, // Maximum similarity for consistent warmth
        style: 0.25, // Lower style for more natural, conversational tone
        use_speaker_boost: true,
      },
    }

    const settings = voiceSettings[style as keyof typeof voiceSettings] || voiceSettings.calm

    // ElevenLabs API call with latest model for maximum naturalness
    const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_turbo_v2_5", // Using the latest Turbo v2.5 model for maximum naturalness
        voice_settings: settings,
      }),
    })

    if (!elevenLabsResponse.ok) {
      const errorData = await elevenLabsResponse.text()
      console.error("ElevenLabs API error:", errorData)

      // Handle specific error cases
      let errorMessage = "ElevenLabs API failed"
      if (elevenLabsResponse.status === 401) {
        errorMessage = "Invalid API key - please check your ElevenLabs API key"
      } else if (elevenLabsResponse.status === 429) {
        errorMessage = "Rate limit exceeded - please try again later"
      } else if (elevenLabsResponse.status === 402) {
        errorMessage = "Insufficient credits - please check your ElevenLabs account"
      }

      return NextResponse.json(
        {
          error: errorMessage,
          fallback: true,
          message: "Using browser speech synthesis as fallback",
          details: errorData,
          status: elevenLabsResponse.status,
        },
        { status: elevenLabsResponse.status },
      )
    }

    // Get the audio data
    const audioBuffer = await elevenLabsResponse.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      audioData: base64Audio,
      contentType: "audio/mpeg",
      voiceId: voiceId,
      style: style,
      success: true,
    })
  } catch (error) {
    console.error("ElevenLabs integration error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate ElevenLabs audio",
        fallback: true,
        message: "Using browser speech synthesis as fallback",
      },
      { status: 500 },
    )
  }
}
