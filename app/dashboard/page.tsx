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
  Trophy,
  Medal,
  Star,
  Play,
  Calendar,
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

  const { data: caseProgress } = await supabase
    .from("user_case_progress")
    .select("*")
    .eq("user_id", userId)

  // Get daily study log for today and streak
  const today = new Date().toISOString().split("T")[0]
  const { data: todayLog } = await supabase
    .from("daily_study_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("study_date", today)
    .single()

  const { data: studyLogs } = await supabase
    .from("daily_study_logs")
    .select("*")
    .eq("user_id", userId)
    .order("study_date", { ascending: false })
    .limit(30)

  // Get recent activity
  const { data: recentDecks } = await supabase
    .from("flashcard_decks")
    .select("id, title, topic:topics(name)")
    .limit(3)

  // Get user's achievements count
  const { count: achievementsCount } = await supabase
    .from("user_achievements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Calculate stats
  const cardsStudied = flashcardProgress?.length || 0
  const questionsAnswered = questionProgress?.length || 0
  const correctAnswers = questionProgress?.filter(q => q.is_correct)?.length || 0
  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0
  const simulationsCompleted = caseProgress?.filter(s => s.completed)?.length || 0

  // Use profile streak or calculate from logs
  const streak = profile?.study_streak || 0
  const longestStreak = profile?.longest_streak || 0
  const totalXp = profile?.total_xp || 0
  const level = profile?.level || 1

  // Calculate XP to next level (each level requires 100 * level XP)
  const xpForCurrentLevel = (level - 1) * 100 * level / 2
  const xpForNextLevel = level * 100 * (level + 1) / 2
  const xpProgress = totalXp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const levelProgress = Math.round((xpProgress / xpNeeded) * 100)

  // Calculate study time this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const weeklyLogs = studyLogs?.filter(log => log.study_date >= weekAgo) || []
  const studyMinutes = weeklyLogs.reduce((acc, log) => acc + (log.minutes_studied || 0), 0)
  const weeklyXp = weeklyLogs.reduce((acc, log) => acc + (log.xp_earned || 0), 0)

  // Today's progress
  const todayFlashcards = todayLog?.flashcards_reviewed || 0
  const todayQuestions = todayLog?.questions_answered || 0
  const todayCases = todayLog?.cases_completed || 0
  const todayXp = todayLog?.xp_earned || 0

  return {
    profile,
    cardsStudied,
    questionsAnswered,
    accuracy,
    simulationsCompleted,
    streak,
    longestStreak,
    totalXp,
    level,
    levelProgress,
    xpProgress,
    xpNeeded,
    studyMinutes,
    weeklyXp,
    recentDecks,
    achievementsCount: achievementsCount || 0,
    todayFlashcards,
    todayQuestions,
    todayCases,
    todayXp,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const data = await getDashboardData(user.id)
  const firstName = data.profile?.username?.split(" ")[0] || user.email?.split("@")[0] || "Student"

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header with XP and Streak */}
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
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">{data.totalXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Level Progress Card */}
      <GlassCard glow>
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
              <Medal className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">Level {data.level}</span>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                {data.xpProgress.toLocaleString()} / {data.xpNeeded.toLocaleString()} XP to Level {data.level + 1}
              </p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <Progress value={data.levelProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>+{data.todayXp} XP today</span>
              <span>+{data.weeklyXp} XP this week</span>
            </div>
          </div>
          <Link href="/dashboard/study-plan">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Play className="w-5 h-5 mr-2" />
              Start Studying
            </Button>
          </Link>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cards Studied"
          value={data.cardsStudied}
          subtitle={`+${data.todayFlashcards} today`}
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
          subtitle={`+${data.todayCases} today`}
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
                <p className="text-sm text-muted-foreground mt-1">+5 XP per card</p>
              </div>
            </Link>
            <Link href="/dashboard/questions" className="block">
              <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-medium text-foreground">Question Bank</h3>
                <p className="text-sm text-muted-foreground mt-1">+10 XP correct</p>
              </div>
            </Link>
            <Link href="/dashboard/simulations" className="block">
              <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-5 h-5 text-success" />
                </div>
                <h3 className="font-medium text-foreground">Case Sims</h3>
                <p className="text-sm text-muted-foreground mt-1">+50 XP complete</p>
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
                <span className="text-foreground font-medium">{Math.min(data.todayFlashcards, 20)}/20</span>
              </div>
              <Progress value={Math.min((data.todayFlashcards / 20) * 100, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Questions answered</span>
                <span className="text-foreground font-medium">{Math.min(data.todayQuestions, 10)}/10</span>
              </div>
              <Progress value={Math.min((data.todayQuestions / 10) * 100, 100)} className="h-2" />
            </div>
            <div className="pt-2">
              <Link href="/dashboard/study-plan">
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Study Plan
                </Button>
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity & Achievements */}
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

        {/* Achievements & Leaderboard */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Achievements</p>
                  <p className="text-sm text-muted-foreground">Badges unlocked</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-400">{data.achievementsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Best Streak</p>
                  <p className="text-sm text-muted-foreground">Longest run</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-warning">{data.longestStreak}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/dashboard/achievements">
                <Button variant="outline" className="w-full">
                  <Trophy className="w-4 h-4 mr-2" />
                  Achievements
                </Button>
              </Link>
              <Link href="/dashboard/leaderboard">
                <Button variant="outline" className="w-full">
                  <Medal className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
