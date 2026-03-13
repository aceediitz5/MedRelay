import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  BookOpen,
  HelpCircle,
  Stethoscope,
  Flame,
  Target,
  Calendar,
  Clock,
  Award,
  Zap,
  Star,
  Trophy,
  Crown,
  Shield,
  Rocket,
  Medal,
} from "lucide-react"
import { cn } from "@/lib/utils"

async function getProgressData(userId: string) {
  const supabase = await createClient()

  // Get user profile with XP
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp, level, current_streak, longest_streak")
    .eq("id", userId)
    .single()

  // Get daily study logs for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const { data: studyLogs } = await supabase
    .from("daily_study_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("study_date", thirtyDaysAgo)
    .order("study_date", { ascending: false })

  // Get flashcard progress
  const { data: flashcardProgress } = await supabase
    .from("user_flashcard_progress")
    .select("confidence_level, last_reviewed, ease_factor, interval_days")
    .eq("user_id", userId)

  // Get question progress
  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select("is_correct, answered_at")
    .eq("user_id", userId)

  // Get simulation progress
  const { data: simProgress } = await supabase
    .from("user_simulation_progress")
    .select("status, score, completed_at")
    .eq("user_id", userId)

  // Get user achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement:achievements(*), unlocked_at")
    .eq("user_id", userId)

  // Get all achievements
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*")
    .order("xp_reward", { ascending: true })

  // Calculate streak from profile or logs
  let streak = profile?.current_streak || 0
  let longestStreak = profile?.longest_streak || 0
  
  // Fallback streak calculation if not in profile
  if (!streak && studyLogs && studyLogs.length > 0) {
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
    longestStreak = Math.max(streak, longestStreak)
  }

  // Calculate totals
  const totalXp = profile?.total_xp || 0
  const level = profile?.level || 1
  const totalCards = flashcardProgress?.length || 0
  const masteredCards = flashcardProgress?.filter(p => p.confidence_level >= 4).length || 0
  const learningCards = flashcardProgress?.filter(p => p.confidence_level >= 2 && p.confidence_level < 4).length || 0
  const totalQuestions = questionProgress?.length || 0
  const correctQuestions = questionProgress?.filter(p => p.is_correct).length || 0
  const accuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0
  const simsCompleted = simProgress?.filter(s => s.status === "completed").length || 0
  const avgSimScore = simsCompleted > 0 
    ? Math.round(simProgress!.filter(s => s.status === "completed").reduce((acc, s) => acc + (s.score || 0), 0) / simsCompleted) 
    : 0
  const totalMinutes = studyLogs?.reduce((acc, log) => acc + (log.minutes_studied || 0), 0) || 0
  const totalXpFromLogs = studyLogs?.reduce((acc, log) => acc + (log.xp_earned || 0), 0) || 0

  // Build activity heatmap (last 30 days)
  const activityMap = new Map(studyLogs?.map(log => [log.study_date, {
    minutes: log.minutes_studied || 0,
    xp: log.xp_earned || 0,
    flashcards: log.flashcards_reviewed || 0,
    questions: log.questions_answered || 0,
  }]) || [])
  
  const activityDays = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const dayData = activityMap.get(date)
    activityDays.push({
      date,
      minutes: dayData?.minutes || 0,
      xp: dayData?.xp || 0,
      flashcards: dayData?.flashcards || 0,
      questions: dayData?.questions || 0,
    })
  }

  // Weekly XP data for chart
  const weeklyXp = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split("T")[0]
    const dayData = activityMap.get(dateStr)
    weeklyXp.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      xp: dayData?.xp || 0,
    })
  }

  // Map achievements
  const unlockedIds = new Set(userAchievements?.map(ua => (ua.achievement as any)?.id))
  const achievements = allAchievements?.map(a => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
    unlockedAt: userAchievements?.find(ua => (ua.achievement as any)?.id === a.id)?.unlocked_at,
  })) || []

  return {
    totalXp,
    level,
    streak,
    longestStreak,
    totalCards,
    masteredCards,
    learningCards,
    totalQuestions,
    correctQuestions,
    accuracy,
    simsCompleted,
    avgSimScore,
    totalMinutes,
    activityDays,
    weeklyXp,
    achievements,
    studyLogs: studyLogs || [],
  }
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const data = await getProgressData(user.id)
  
  // XP for next level calculation
  const xpForCurrentLevel = (data.level - 1) * 500
  const xpForNextLevel = data.level * 500
  const xpProgress = ((data.totalXp - xpForCurrentLevel) / 500) * 100
  const xpToNextLevel = xpForNextLevel - data.totalXp

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning journey and level up your knowledge
          </p>
        </div>
        
        {/* Level Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">Level {data.level}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-yellow-400">{data.totalXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* XP Progress to Next Level */}
      <GlassCard className="p-6" glow>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-foreground">Progress to Level {data.level + 1}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {xpToNextLevel} XP to go
          </span>
        </div>
        <Progress value={xpProgress} className="h-4" />
        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
          <span>Level {data.level}</span>
          <span>{Math.round(xpProgress)}%</span>
          <span>Level {data.level + 1}</span>
        </div>
      </GlassCard>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.longestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.masteredCards}</p>
              <p className="text-xs text-muted-foreground">Mastered</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{Math.round(data.totalMinutes / 60)}h</p>
              <p className="text-xs text-muted-foreground">Study Time</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Weekly XP Chart */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Weekly XP
          </h2>
          <span className="text-sm text-muted-foreground">Last 7 days</span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {data.weeklyXp.map((day, i) => {
            const maxXp = Math.max(...data.weeklyXp.map(d => d.xp), 100)
            const height = day.xp > 0 ? Math.max(10, (day.xp / maxXp) * 100) : 4
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={cn(
                    "w-full rounded-t-md transition-all",
                    day.xp > 0 ? "bg-gradient-to-t from-primary/50 to-primary" : "bg-secondary"
                  )}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Activity Heatmap */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Study Activity (Last 30 Days)
          </h2>
        </div>
        <div className="flex gap-1 flex-wrap">
          {data.activityDays.map((day) => (
            <div
              key={day.date}
              className={cn(
                "w-4 h-4 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-primary/50",
                day.minutes === 0 && "bg-secondary",
                day.minutes > 0 && day.minutes < 15 && "bg-primary/30",
                day.minutes >= 15 && day.minutes < 30 && "bg-primary/50",
                day.minutes >= 30 && day.minutes < 60 && "bg-primary/70",
                day.minutes >= 60 && "bg-primary"
              )}
              title={`${day.date}: ${day.minutes}min, ${day.xp}XP, ${day.flashcards} cards, ${day.questions} questions`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/50" />
          <div className="w-3 h-3 rounded-sm bg-primary/70" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>More</span>
        </div>
      </GlassCard>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flashcards */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Flashcards</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total Cards Studied</span>
                <span className="text-foreground">{data.totalCards}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Mastered</span>
                <span className="text-success">{data.masteredCards}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Learning</span>
                <span className="text-warning">{data.learningCards}</span>
              </div>
            </div>
            <Progress value={data.totalCards > 0 ? (data.masteredCards / data.totalCards) * 100 : 0} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {data.totalCards > 0 ? Math.round((data.masteredCards / data.totalCards) * 100) : 0}% mastery rate
            </p>
          </div>
        </GlassCard>

        {/* Questions */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Question Bank</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Questions Answered</span>
                <span className="text-foreground">{data.totalQuestions}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Correct</span>
                <span className="text-success">{data.correctQuestions}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Incorrect</span>
                <span className="text-destructive">{data.totalQuestions - data.correctQuestions}</span>
              </div>
            </div>
            <Progress value={data.accuracy} className="h-2" />
            <p className={cn(
              "text-xs",
              data.accuracy >= 70 ? "text-success" : data.accuracy >= 50 ? "text-warning" : "text-destructive"
            )}>
              {data.accuracy}% accuracy
            </p>
          </div>
        </GlassCard>

        {/* Simulations */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-success" />
            </div>
            <h3 className="font-semibold text-foreground">Case Simulations</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Cases Completed</span>
                <span className="text-foreground">{data.simsCompleted}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Average Score</span>
                <span className={cn(
                  "font-medium",
                  data.avgSimScore >= 70 ? "text-success" : data.avgSimScore >= 50 ? "text-warning" : "text-destructive"
                )}>{data.avgSimScore}%</span>
              </div>
            </div>
            <Progress value={data.avgSimScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Keep practicing to improve your clinical skills
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Achievements */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
            <p className="text-sm text-muted-foreground">
              {data.achievements.filter(a => a.unlocked).length} of {data.achievements.length} unlocked
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data.achievements.slice(0, 8).map((achievement) => (
            <AchievementBadge 
              key={achievement.id}
              title={achievement.name} 
              description={achievement.description}
              xpReward={achievement.xp_reward}
              icon={achievement.icon}
              unlocked={achievement.unlocked}
            />
          ))}
          {data.achievements.length === 0 && (
            <>
              <AchievementBadge 
                title="First Steps" 
                description="Complete your first study session"
                xpReward={50}
                icon="rocket"
                unlocked={data.studyLogs.length > 0}
              />
              <AchievementBadge 
                title="Week Warrior" 
                description="7 day study streak"
                xpReward={100}
                icon="flame"
                unlocked={data.streak >= 7}
              />
              <AchievementBadge 
                title="Card Master" 
                description="Master 50 flashcards"
                xpReward={150}
                icon="book"
                unlocked={data.masteredCards >= 50}
              />
              <AchievementBadge 
                title="Sharp Mind" 
                description="80% question accuracy"
                xpReward={200}
                icon="target"
                unlocked={data.accuracy >= 80}
              />
            </>
          )}
        </div>
      </GlassCard>
    </div>
  )
}

function AchievementBadge({ 
  title, 
  description, 
  xpReward,
  icon,
  unlocked 
}: { 
  title: string
  description: string
  xpReward?: number
  icon?: string
  unlocked: boolean 
}) {
  const IconComponent = icon === "flame" ? Flame 
    : icon === "rocket" ? Rocket 
    : icon === "book" ? BookOpen 
    : icon === "target" ? Target
    : icon === "shield" ? Shield
    : icon === "crown" ? Crown
    : icon === "medal" ? Medal
    : Award

  return (
    <div className={cn(
      "p-4 rounded-lg border text-center transition-all",
      unlocked 
        ? "bg-yellow-500/10 border-yellow-500/30" 
        : "bg-secondary/30 border-transparent opacity-50"
    )}>
      <IconComponent className={cn(
        "w-8 h-8 mx-auto mb-2",
        unlocked ? "text-yellow-400" : "text-muted-foreground"
      )} />
      <p className={cn(
        "font-medium text-sm",
        unlocked ? "text-foreground" : "text-muted-foreground"
      )}>{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {xpReward && (
        <div className={cn(
          "flex items-center justify-center gap-1 mt-2 text-xs",
          unlocked ? "text-yellow-400" : "text-muted-foreground"
        )}>
          <Zap className="w-3 h-3" />
          <span>+{xpReward} XP</span>
        </div>
      )}
    </div>
  )
}
