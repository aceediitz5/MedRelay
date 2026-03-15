import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const today = new Date()
    today.setHours(0,0,0,0)

    const { count: qCount } = await supabase
      .from("user_question_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString())

    const { count: fCount } = await supabase
      .from("user_flashcard_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString())

    const { count: sCount } = await supabase
      .from("user_case_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString())

    return NextResponse.json({
      goals: { questions: 40, flashcards: 20, simulations: 1 },
      progress: {
        questions: qCount || 0,
        flashcards: fCount || 0,
        simulations: sCount || 0,
      }
    })
  } catch (err) {
    console.error("Daily goal error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
