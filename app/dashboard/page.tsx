import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/dashboard/stat-card"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  BookOpen,
  HelpCircle,
  Stethoscope,
  TrendingUp,
  Flame,
  Target,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react"

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  
  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  // Get study stats
  const { data: flashcardProgress } = await supabase
    .from("user_flashcard_progress")
    .select("*")
    .eq("user_id", userId)

  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select("*")
    .eq("user_id", userId)

  const { data: simProgress } = await supabase
    .from("user_simulation_progress")
    .select("*, case_simulations(title)")
    .eq("user_id", userId)

  // Get daily study log for streak
  const { data: studyLogs } = await supabase
    .from("daily_study_log")
    .select("*")
    .eq("user_id", userId)
    .order("study_date", { ascending: false })
    .limit(30)

  // Get recent activity
  const { data: recentDecks } = await supabase
    .from("flashcard_decks")
    .select("id, title, topic:topics(name)")
    .limit(3)

  // Calculate stats
  const cardsStudied = flashcardProgress?.length || 0
  const questionsAnswered = questionProgress?.length || 0
  const correctAnswers = questionProgress?.filter(q => q.is_correct)?.length || 0
  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0
  const simulationsCompleted = simProgress?.filter(s => s.status === "completed")?.length || 0

  // Calculate streak
  let streak = 0
  if (studyLogs && studyLogs.length > 0) {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    
    if (studyLogs[0]?.study_date === today || studyLogs[0]?.study_date === yesterday) {
      streak = 1
      for (let i = 1; i < studyLogs.length; i++) {
        const prevDate = new Date(studyLogs[i - 1].study_date)
        const currDate = new Date(studyLogs[i].study_date)
        const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000
        if (diffDays === 1) {
          streak++
        } else {
          break
        }
      }
    }
  }

  // Calculate study time this week (mock for now)
  const studyMinutes = studyLogs?.reduce((acc, log) => acc + (log.minutes_studied || 0), 0) || 0

  return {
    profile,
    cardsStudied,
    questionsAnswered,
    accuracy,
    simulationsCompleted,
    streak,
    studyMinutes,
    recentDecks,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const data = await getDashboardData(user.id)
  const firstName = data.profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Student"

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Ready to continue your medical education journey?"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/20 text-warning">
            <Flame className="w-5 h-5" />
            <span className="font-semibold">{data.streak} day streak</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cards Studied"
          value={data.cardsStudied}
          subtitle="Total flashcards reviewed"
          icon={BookOpen}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Questions Answered"
          value={data.questionsAnswered}
          subtitle={`${data.accuracy}% accuracy`}
          icon={HelpCircle}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Simulations"
          value={data.simulationsCompleted}
          subtitle="Cases completed"
          icon={Stethoscope}
        />
        <StatCard
          title="Study Time"
          value={`${Math.round(data.studyMinutes / 60)}h`}
          subtitle="This week"
          icon={Clock}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Studying */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Quick Start</h2>
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/dashboard/flashcards" className="block">
              <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground">Flashcards</h3>
                <p className="text-sm text-muted-foreground mt-1">Review key concepts</p>
              </div>
            </Link>
            <Link href="/dashboard/questions" className="block">
              <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-medium text-foreground">Question Bank</h3>
                <p className="text-sm text-muted-foreground mt-1">Test your knowledge</p>
              </div>
            </Link>
            <Link href="/dashboard/simulations" className="block">
              <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-5 h-5 text-success" />
                </div>
                <h3 className="font-medium text-foreground">Case Sims</h3>
                <p className="text-sm text-muted-foreground mt-1">Practice scenarios</p>
              </div>
            </Link>
          </div>
        </GlassCard>

        {/* Daily Goal */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Daily Goal</h2>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Cards reviewed</span>
                <span className="text-foreground font-medium">{Math.min(data.cardsStudied, 20)}/20</span>
              </div>
              <Progress value={Math.min((data.cardsStudied / 20) * 100, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Questions answered</span>
                <span className="text-foreground font-medium">{Math.min(data.questionsAnswered, 10)}/10</span>
              </div>
              <Progress value={Math.min((data.questionsAnswered / 10) * 100, 100)} className="h-2" />
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                {data.cardsStudied >= 20 && data.questionsAnswered >= 10 
                  ? "Great job! You've completed your daily goal!"
                  : "Keep going! You're making great progress."}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity & Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Decks */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Continue Learning</h2>
            <Link href="/dashboard/flashcards">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentDecks && data.recentDecks.length > 0 ? (
              data.recentDecks.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/dashboard/flashcards/${deck.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{deck.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {(deck.topic as { name: string } | null)?.name || "General"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No decks available yet</p>
            )}
          </div>
        </GlassCard>

        {/* Performance Overview */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Performance</h2>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Accuracy Rate</p>
                  <p className="text-sm text-muted-foreground">Question bank performance</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-success">{data.accuracy}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Current Streak</p>
                  <p className="text-sm text-muted-foreground">Days of consistent study</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-warning">{data.streak}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Cards Mastered</p>
                  <p className="text-sm text-muted-foreground">Confidence level 4+</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{data.cardsStudied}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
