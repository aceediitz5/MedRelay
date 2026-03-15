import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

async function countTable(supabase: any, table: string) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
    if (error) return 0
    return count || 0
  } catch {
    return 0
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const [flashcards, questions, simulations, practiceExams] = await Promise.all([
      countTable(supabase, "flashcards"),
      countTable(supabase, "questions"),
      countTable(supabase, "case_simulations"),
      countTable(supabase, "practice_exams"),
    ])

    return NextResponse.json({
      flashcards,
      questions,
      simulations,
      practiceExams,
    })
  } catch (error) {
    console.error("Content summary error:", error)
    return NextResponse.json(
      { flashcards: 0, questions: 0, simulations: 0, practiceExams: 0 },
      { status: 500 }
    )
  }
}
