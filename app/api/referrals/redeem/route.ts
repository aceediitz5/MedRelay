import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const REWARD_DAYS = 7

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code } = (await req.json()) as { code?: string }
  if (!code) {
    return NextResponse.json({ error: "Referral code required" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: referral } = await admin
    .from("referrals")
    .select("id, user_id, code")
    .eq("code", code.toUpperCase())
    .single()

  if (!referral) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
  }

  if (referral.user_id === user.id) {
    return NextResponse.json({ error: "You cannot refer yourself" }, { status: 400 })
  }

  const { data: existing } = await admin
    .from("referral_uses")
    .select("id")
    .eq("referred_user_id", user.id)
    .single()

  if (existing?.id) {
    return NextResponse.json({ error: "Referral already redeemed" }, { status: 400 })
  }

  const now = new Date()

  const { data: referrerProfile } = await admin
    .from("profiles")
    .select("pro_granted_until")
    .eq("id", referral.user_id)
    .single()

  const { data: referredProfile } = await admin
    .from("profiles")
    .select("pro_granted_until")
    .eq("id", user.id)
    .single()

  const referrerBase = referrerProfile?.pro_granted_until
    ? new Date(referrerProfile.pro_granted_until)
    : now
  const referredBase = referredProfile?.pro_granted_until
    ? new Date(referredProfile.pro_granted_until)
    : now

  const referrerGrant = addDays(referrerBase > now ? referrerBase : now, REWARD_DAYS)
  const referredGrant = addDays(referredBase > now ? referredBase : now, REWARD_DAYS)

  await admin.from("referral_uses").insert({
    referral_id: referral.id,
    referrer_id: referral.user_id,
    referred_user_id: user.id,
  })

  await admin
    .from("profiles")
    .update({ pro_granted_until: referrerGrant.toISOString() })
    .eq("id", referral.user_id)

  await admin
    .from("profiles")
    .update({ pro_granted_until: referredGrant.toISOString() })
    .eq("id", user.id)

  return NextResponse.json({
    success: true,
    referrer_grant_until: referrerGrant.toISOString(),
    referred_grant_until: referredGrant.toISOString(),
  })
}
