import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getTrackBySlug } from "@/lib/tracks"

export async function POST(req: Request) {
  try {
    const { email, track } = (await req.json()) as { email?: string; track?: string }

    if (!email || !track) {
      return NextResponse.json({ error: "Missing email or track" }, { status: 400 })
    }

    const trackConfig = getTrackBySlug(track)
    if (!trackConfig) {
      return NextResponse.json({ error: "Invalid track" }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from("waitlist_signups")
      .insert({ email, track })

    if (error) {
      return NextResponse.json({ error: "Failed to save waitlist signup" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Waitlist signup error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
