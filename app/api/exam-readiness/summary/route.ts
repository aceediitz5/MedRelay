import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        accuracy: 0,
        readinessScore: 0,
        confidenceLow: 0,
        confidenceHigh: 0,
        weakTopics: [],
        studiedToday: false,
        dailyLimitReached: false,
      })
    }

    const { data: attempts, error } = await supabase
      .from("question_attempts")
      .select("is_correct, created_at, topic")
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({
        accuracy: 0,
        readinessScore: 0,
        confidenceLow: 0,
        confidenceHigh: 0,
        weakTopics: [],
        studiedToday: false,
        dailyLimitReached: false,
      })
    }

    const total = attempts?.length || 0
    const correct = (attempts || []).filter((a) => a.is_correct).length
    const accuracy = total > 0 ? correct / total : 0

    const z = 1.96
    const margin = total > 0 ? z * Math.sqrt((accuracy * (1 - accuracy)) / total) : 0
    const confidenceLow = clamp01(accuracy - margin)
    const confidenceHigh = clamp01(accuracy + margin)

    const readinessScore = Math.round(accuracy * 100)

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const studiedToday = (attempts || []).some(
      (a) => new Date(a.created_at).getTime() >= startOfToday.getTime()
    )

    const weakMap = new Map<string, number>()
    ;(attempts || []).forEach((a) => {
      if (!a.is_correct && a.topic) {
        weakMap.set(a.topic, (weakMap.get(a.topic) || 0) + 1)
      }
    })
    const weakTopics = Array.from(weakMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, incorrect]) => ({ topic, incorrect }))

    return NextResponse.json({
      accuracy,
      readinessScore,
      confidenceLow,
      confidenceHigh,
      weakTopics,
      studiedToday,
      dailyLimitReached: false,
    })
  } catch (error) {
    return NextResponse.json(
      {
        accuracy: 0,
        readinessScore: 0,
        confidenceLow: 0,
        confidenceHigh: 0,
        weakTopics: [],
        studiedToday: false,
        dailyLimitReached: false,
      },
      { status: 500 }
    )
  }
}
