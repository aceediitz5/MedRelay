import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ purchasedExamIds: [], isPro: false })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single()

    const { data: purchases } = await supabase
      .from("exam_purchases")
      .select("exam_package_id")
      .eq("user_id", user.id)

    const purchasedExamIds = (purchases || []).map((p) => p.exam_package_id)

    return NextResponse.json({ purchasedExamIds, isPro: Boolean(profile?.is_pro) })
  } catch (error) {
    console.error("Error fetching user purchases:", error)
    return NextResponse.json({ purchasedExamIds: [], isPro: false }, { status: 500 })
  }
}
