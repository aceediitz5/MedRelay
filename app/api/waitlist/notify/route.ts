import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || "medrelay.help@gmail.com"

export async function POST(req: Request) {
  const secret = req.headers.get("x-waitlist-secret")
  if (!secret || secret !== process.env.WAITLIST_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { track } = (await req.json()) as { track?: string }
  if (!track) {
    return NextResponse.json({ error: "Missing track" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: rows } = await supabase
    .from("waitlist_signups")
    .select("id,email")
    .eq("track", track)
    .is("notified_at", null)

  if (!rows || rows.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  for (const row of rows) {
    await resend.emails.send({
      from: `MedRelay <${FROM}>`,
      to: row.email,
      subject: `${track} is now live on MedRelay`,
      html: `
        <p>Hi there!</p>
        <p>Your ${track} prep track is now live on MedRelay.</p>
        <p>Click below to get started:</p>
        <p><a href="https://medrelay0.vercel.app/auth/sign-up">Start now</a></p>
      `,
    })

    await supabase
      .from("waitlist_signups")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", row.id)
  }

  return NextResponse.json({ sent: rows.length })
}
