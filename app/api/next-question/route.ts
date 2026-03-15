import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Pull recent performance to find weak topics
    const { data: attempts } = await supabase
      .from("user_question_progress")
      .select("is_correct, questions(topic_id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200)

    const topicStats: Record<string, { correct: number; total: number }> = {}
    attempts?.forEach((a: any) => {
      const topicId = a.questions?.topic_id
      if (!topicId) return
      if (!topicStats[topicId]) topicStats[topicId] = { correct: 0, total: 0 }
      topicStats[topicId].total += 1
      if (a.is_correct) topicStats[topicId].correct += 1
    })

    // Choose weakest topic
    const weakTopicId =
      Object.entries(topicStats)
        .map(([id, s]) => ({ id, acc: s.total ? s.correct / s.total : 0 }))
        .sort((a, b) => a.acc - b.acc)[0]?.id || null

    // Pull candidate questions (prioritize weak topic)
    let qQuery = supabase
      .from("questions")
      .select("*")
      .limit(50)

    if (weakTopicId) qQuery = qQuery.eq("topic_id", weakTopicId)

    const { data: candidates } = await qQuery

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ error: "No questions found" }, { status: 404 })
    }

    // Weighted random: higher weight + harder difficulty more likely
    const weighted = candidates.map((q: any) => ({
      q,
      weight: (q.question_weight || 1) * (q.difficulty_score || 0.5),
    }))

    const total = weighted.reduce((sum, w) => sum + w.weight, 0)
    let r = Math.random() * total
    for (const w of weighted) {
      r -= w.weight
      if (r <= 0) return NextResponse.json(w.q)
    }

    return NextResponse.json(weighted[0].q)
  } catch (err) {
    console.error("Adaptive question error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
