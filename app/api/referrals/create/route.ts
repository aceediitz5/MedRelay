import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: existing } = await supabase
    .from("referrals")
    .select("code")
    .eq("user_id", user.id)
    .single()

  if (existing?.code) {
    return NextResponse.json({ code: existing.code })
  }

  let code = generateCode()
  let attempts = 0

  while (attempts < 5) {
    const { error } = await supabase
      .from("referrals")
      .insert({ user_id: user.id, code: code.toUpperCase() })
    if (!error) {
      return NextResponse.json({ code })
    }
    code = generateCode()
    attempts += 1
  }

  return NextResponse.json({ error: "Failed to create referral code" }, { status: 500 })
}
