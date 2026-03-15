import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [{ data: achievements }, { data: profile }] = await Promise.all([
    supabase.from("achievements").select("*"),
    supabase
      .from("profiles")
      .select("study_streak, total_xp")
      .eq("id", user.id)
      .single(),
  ])

  const { data: studyLogs } = await supabase
    .from("daily_study_logs")
    .select("flashcards_reviewed, questions_answered, cases_completed, xp_earned, study_date")
    .eq("user_id", user.id)

  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select("is_correct")
    .eq("user_id", user.id)

  const { data: caseProgress } = await supabase
    .from("user_case_progress")
    .select("completed")
    .eq("user_id", user.id)

  const totalCards = studyLogs?.reduce((acc, log) => acc + (log.flashcards_reviewed || 0), 0) || 0
  const totalCases = caseProgress?.filter(c => c.completed)?.length || 0
  const totalSessions = studyLogs?.filter(log => (log.flashcards_reviewed || 0) + (log.questions_answered || 0) + (log.cases_completed || 0) > 0).length || 0
  const totalXpLogs = studyLogs?.reduce((acc, log) => acc + (log.xp_earned || 0), 0) || 0
  const totalXp = profile?.total_xp || totalXpLogs

  const totalQuestions = questionProgress?.length || 0
  const correctQuestions = questionProgress?.filter(q => q.is_correct)?.length || 0
  const accuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0

  const stats = {
    streak: profile?.study_streak || 0,
    cards_reviewed: totalCards,
    cases_completed: totalCases,
    xp_total: totalXp,
    accuracy,
    sessions_completed: totalSessions,
  }

  const { data: existingUnlocks } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", user.id)

  const unlockedIds = new Set(existingUnlocks?.map(u => u.achievement_id))
  const toUnlock = (achievements || []).filter((a: any) => {
    if (unlockedIds.has(a.id)) return false
    const statValue = (stats as Record<string, number>)[a.requirement_type] || 0
    return statValue >= a.requirement_value
  })

  if (toUnlock.length === 0) {
    return NextResponse.json({ unlocked: 0 })
  }

  const inserts = toUnlock.map((a: any) => ({
    user_id: user.id,
    achievement_id: a.id,
  }))

  await supabase.from("user_achievements").insert(inserts)

  return NextResponse.json({ unlocked: inserts.length })
}
