import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Flame,
  BookOpen,
  HelpCircle,
  Stethoscope,
  Star,
  Zap,
  Target,
  Award,
  Crown,
  Medal,
  Sparkles,
  Lock,
  CheckCircle,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  xp_reward: number
  requirement_type: string
  requirement_value: number
  unlocked: boolean
  unlocked_at?: string
  progress: number
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  "book-open": BookOpen,
  "help-circle": HelpCircle,
  stethoscope: Stethoscope,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
  crown: Crown,
  medal: Medal,
  sparkles: Sparkles,
  trophy: Trophy,
  "trending-up": TrendingUp,
  calendar: Calendar,
}

async function getAchievementsData(userId: string) {
  const supabase = await createClient()

  // Get all achievements
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("requirement_value", { ascending: true })

  // Get user's unlocked achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", userId)

  // Get user stats for progress calculation
  const { data: profile } = await supabase
    .from("profiles")
    .select("study_streak, longest_streak, total_xp, level")
    .eq("id", userId)
    .single()

  const { data: flashcardProgress } = await supabase
    .from("user_flashcard_progress")
    .select("id, difficulty")
    .eq("user_id", userId)

  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select("id, is_correct")
    .eq("user_id", userId)

  const { data: caseProgress } = await supabase
    .from("user_case_progress")
    .select("id, completed")
    .eq("user_id", userId)

  const { data: studyLogs } = await supabase
    .from("daily_study_logs")
    .select("id")
    .eq("user_id", userId)

  // Calculate progress for each achievement
  const unlockedMap = new Map(userAchievements?.map(ua => [ua.achievement_id, ua.unlocked_at]))
  
  const stats = {
    study_streak: profile?.study_streak || 0,
    longest_streak: profile?.longest_streak || 0,
    total_xp: profile?.total_xp || 0,
    flashcards_mastered: flashcardProgress?.filter(fp => fp.difficulty === "mastered")?.length || 0,
    flashcards_reviewed: flashcardProgress?.length || 0,
    questions_answered: questionProgress?.length || 0,
    questions_correct: questionProgress?.filter(qp => qp.is_correct)?.length || 0,
    cases_completed: caseProgress?.filter(cp => cp.completed)?.length || 0,
    study_sessions: studyLogs?.length || 0,
    level: profile?.level || 1,
  }

  const achievementsList: Achievement[] = (achievements || []).map(a => {
    let progress = 0
    
    switch (a.requirement_type) {
      case "streak":
        progress = Math.min((stats.study_streak / a.requirement_value) * 100, 100)
        break
      case "flashcards_mastered":
        progress = Math.min((stats.flashcards_mastered / a.requirement_value) * 100, 100)
        break
      case "flashcards_reviewed":
        progress = Math.min((stats.flashcards_reviewed / a.requirement_value) * 100, 100)
        break
      case "questions_answered":
        progress = Math.min((stats.questions_answered / a.requirement_value) * 100, 100)
        break
      case "questions_correct":
        progress = Math.min((stats.questions_correct / a.requirement_value) * 100, 100)
        break
      case "cases_completed":
        progress = Math.min((stats.cases_completed / a.requirement_value) * 100, 100)
        break
      case "study_sessions":
        progress = Math.min((stats.study_sessions / a.requirement_value) * 100, 100)
        break
      case "total_xp":
        progress = Math.min((stats.total_xp / a.requirement_value) * 100, 100)
        break
      case "level":
        progress = Math.min((stats.level / a.requirement_value) * 100, 100)
        break
      default:
        progress = 0
    }

    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.description || "",
      icon: a.icon || "trophy",
      xp_reward: a.xp_reward || 0,
      requirement_type: a.requirement_type,
      requirement_value: a.requirement_value,
      unlocked: unlockedMap.has(a.id),
      unlocked_at: unlockedMap.get(a.id),
      progress: Math.round(progress),
    }
  })

  const unlockedAchievements = achievementsList.filter(a => a.unlocked)
  const lockedAchievements = achievementsList.filter(a => !a.unlocked)
  const totalXpFromAchievements = unlockedAchievements.reduce((acc, a) => acc + a.xp_reward, 0)

  return {
    achievements: achievementsList,
    unlockedAchievements,
    lockedAchievements,
    totalXpFromAchievements,
    stats,
  }
}

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const data = await getAchievementsData(user.id)

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
          <p className="text-muted-foreground mt-1">
            Track your milestones and unlock rewards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{data.unlockedAchievements.length}/{data.achievements.length}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">+{data.totalXpFromAchievements} XP</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <Flame className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{data.stats.study_streak}</p>
          <p className="text-sm text-muted-foreground">Current Streak</p>
        </GlassCard>
        <GlassCard className="text-center">
          <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{data.stats.flashcards_reviewed}</p>
          <p className="text-sm text-muted-foreground">Cards Reviewed</p>
        </GlassCard>
        <GlassCard className="text-center">
          <HelpCircle className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{data.stats.questions_answered}</p>
          <p className="text-sm text-muted-foreground">Questions Answered</p>
        </GlassCard>
        <GlassCard className="text-center">
          <Stethoscope className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{data.stats.cases_completed}</p>
          <p className="text-sm text-muted-foreground">Cases Completed</p>
        </GlassCard>
      </div>

      {/* Unlocked Achievements */}
      {data.unlockedAchievements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <h2 className="text-xl font-semibold text-foreground">Unlocked ({data.unlockedAchievements.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.unlockedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {data.lockedAchievements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">In Progress ({data.lockedAchievements.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.lockedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* No Achievements */}
      {data.achievements.length === 0 && (
        <GlassCard className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Achievements Yet</h2>
          <p className="text-muted-foreground">Start studying to unlock your first achievement!</p>
        </GlassCard>
      )}
    </div>
  )
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const IconComponent = ICON_MAP[achievement.icon] || Trophy

  return (
    <GlassCard 
      className={cn(
        "relative overflow-hidden transition-all",
        achievement.unlocked 
          ? "border-yellow-500/30 bg-yellow-500/5" 
          : "opacity-75"
      )}
    >
      {achievement.unlocked && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      )}
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
            achievement.unlocked 
              ? "bg-yellow-500/20" 
              : "bg-secondary"
          )}>
            {achievement.unlocked ? (
              <IconComponent className="w-7 h-7 text-yellow-400" />
            ) : (
              <Lock className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground">{achievement.title}</h3>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full shrink-0",
                achievement.unlocked 
                  ? "bg-yellow-500/20 text-yellow-400" 
                  : "bg-secondary text-muted-foreground"
              )}>
                +{achievement.xp_reward} XP
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
          </div>
        </div>

        {!achievement.unlocked && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground">{achievement.progress}%</span>
            </div>
            <Progress value={achievement.progress} className="h-2" />
          </div>
        )}

        {achievement.unlocked && achievement.unlocked_at && (
          <p className="text-xs text-muted-foreground mt-3">
            Unlocked on {new Date(achievement.unlocked_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </GlassCard>
  )
}
