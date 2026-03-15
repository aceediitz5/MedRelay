import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type CountResult = {
  table: string
  count: number
}

async function countTable(supabase: any, table: string): Promise<CountResult> {
  try {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })

    if (error) return { table, count: 0 }
    return { table, count: count || 0 }
  } catch {
    return { table, count: 0 }
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const tables = [
      { key: "flashcards", table: "flashcards" },
      { key: "questions", table: "questions" },
      { key: "simulations", table: "case_simulations" },
      { key: "practiceExams", table: "practice_exams" },
    ]

    const results = await Promise.all(
      tables.map((t) => countTable(supabase, t.table))
    )

    const map: Record<string, number> = {}
    results.forEach((r) => {
      map[r.table] = r.count
    })

    return NextResponse.json({
      flashcards: map.flashcards || 0,
      questions: map.questions || 0,
      simulations: map.case_simulations || 0,
      practiceExams: map.practice_exams || 0,
    })
  } catch (error) {
    console.error("Content summary error:", error)
    return NextResponse.json(
      { flashcards: 0, questions: 0, simulations: 0, practiceExams: 0 },
      { status: 500 }
    )
  }
}
