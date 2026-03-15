import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Zap, BookOpen, HelpCircle, Stethoscope, TrendingUp } from "lucide-react"

export default async function WeeklyRecapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 6)

  const { data: logs } = await supabase
    .from("daily_study_logs")
    .select("study_date, flashcards_reviewed, questions_answered, cases_completed, xp_earned")
    .eq("user_id", user.id)
    .gte("study_date", start.toISOString().split("T")[0])
    .order("study_date", { ascending: true })

  const totals = (logs || []).reduce(
    (acc, log) => ({
      flashcards: acc.flashcards + (log.flashcards_reviewed || 0),
      questions: acc.questions + (log.questions_answered || 0),
      cases: acc.cases + (log.cases_completed || 0),
      xp: acc.xp + (log.xp_earned || 0),
    }),
    { flashcards: 0, questions: 0, cases: 0, xp: 0 }
  )

  const maxXp = Math.max(...(logs || []).map(l => l.xp_earned || 0), 1)

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Weekly Recap</h1>
        <p className="text-muted-foreground mt-1">
          Your last 7 days of progress at a glance.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">XP Earned</p>
            <p className="text-xl font-bold text-foreground">{totals.xp}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Flashcards</p>
            <p className="text-xl font-bold text-foreground">{totals.flashcards}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Questions</p>
            <p className="text-xl font-bold text-foreground">{totals.questions}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cases</p>
            <p className="text-xl font-bold text-foreground">{totals.cases}</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Daily XP</h2>
        </div>
        <div className="space-y-3">
          {(logs || []).map((log) => {
            const day = new Date(log.study_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
            const percent = Math.round(((log.xp_earned || 0) / maxXp) * 100)
            return (
              <div key={log.study_date} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{day}</span>
                  <span className="text-foreground font-medium">{log.xp_earned || 0} XP</span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>
            )
          })}
        </div>
      </GlassCard>

      <GlassCard className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Keep the momentum</p>
          <p className="text-foreground font-medium">Set a goal for next week in Settings.</p>
        </div>
      </GlassCard>
    </div>
  )
}
