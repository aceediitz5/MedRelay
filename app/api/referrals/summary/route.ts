import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const REWARD_DAYS = 7

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: referral } = await supabase
    .from("referrals")
    .select("id, code")
    .eq("user_id", user.id)
    .single()

  if (!referral) {
    return NextResponse.json({ code: null, referrals: 0, rewardDays: 0 })
  }

  const { count } = await supabase
    .from("referral_uses")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", user.id)

  const referrals = count || 0

  return NextResponse.json({
    code: referral.code,
    referrals,
    rewardDays: referrals * REWARD_DAYS,
  })
}
