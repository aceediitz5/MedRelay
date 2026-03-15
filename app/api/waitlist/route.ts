import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { email, track } = (await req.json()) as { email?: string; track?: string }
    if (!email || !track) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const supabase = await createClient()
    await supabase.from("waitlist_signups").insert({
      email: email.toLowerCase().trim(),
      track,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Waitlist error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
