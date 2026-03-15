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

  const trackLink = `https://medrelayapp.com/auth/sign-up?track=${track}`

  for (const row of rows) {
    await resend.emails.send({
      from: `MedRelay <${FROM}>`,
      to: row.email,
      subject: `${track} is now live on MedRelay`,
      html: `
        <div style="font-family: Arial, sans-serif; background:#0b0f14; padding:40px; color:#e5e7eb;">
          <div style="max-width:600px; margin:0 auto; background:#111827; border-radius:16px; padding:32px; border:1px solid #1f2937;">
            <h1 style="color:#ffffff; font-size:24px; margin-bottom:12px;">
              ${track} Prep is now live
            </h1>
            <p style="color:#9ca3af; font-size:15px; line-height:1.6;">
              You’re officially off the waitlist. Your <strong>${track}</strong> track is now available with full flashcards, questions, and simulations.
            </p>
            <div style="margin:24px 0;">
              <a href="${trackLink}" 
                 style="display:inline-block; background:linear-gradient(90deg,#06b6d4,#3b82f6); color:white; text-decoration:none; padding:14px 24px; border-radius:10px; font-weight:600;">
                Start Studying Now
              </a>
            </div>
            <p style="color:#9ca3af; font-size:13px;">
              Need help? Just reply to this email and we’ll get back to you.
            </p>
            <div style="margin-top:30px; border-top:1px solid #1f2937; padding-top:16px;">
              <p style="color:#6b7280; font-size:12px;">
                MedRelay • Built for the future of medical education
              </p>
            </div>
          </div>
        </div>
      `,
    })

    await supabase
      .from("waitlist_signups")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", row.id)
  }

  return NextResponse.json({ sent: rows.length })
}
