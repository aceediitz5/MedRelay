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
} from "lucide-react"
import { cn } from "@/lib/utils"

async function getProgressData(userId: string) {
  const supabase = await createClient()

  // Get daily study logs for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const { data: studyLogs } = await supabase
    .from("daily_study_log")
    .select("*")
    .eq("user_id", userId)
    .gte("study_date", thirtyDaysAgo)
    .order("study_date", { ascending: false })

  // Get flashcard progress
  const { data: flashcardProgress } = await supabase
    .from("user_flashcard_progress")
    .select("confidence_level, last_reviewed")
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

  // Get topics for breakdown
  const { data: topics } = await supabase
    .from("topics")
    .select(`
      id, name, icon,
      flashcard_decks(id, flashcards(id)),
      questions(id)
    `)

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

  // Calculate totals
  const totalCards = flashcardProgress?.length || 0
  const masteredCards = flashcardProgress?.filter(p => p.confidence_level >= 4).length || 0
  const totalQuestions = questionProgress?.length || 0
  const correctQuestions = questionProgress?.filter(p => p.is_correct).length || 0
  const accuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0
  const simsCompleted = simProgress?.filter(s => s.status === "completed").length || 0
  const avgSimScore = simsCompleted > 0 
    ? Math.round(simProgress!.filter(s => s.status === "completed").reduce((acc, s) => acc + (s.score || 0), 0) / simsCompleted) 
    : 0
  const totalMinutes = studyLogs?.reduce((acc, log) => acc + (log.minutes_studied || 0), 0) || 0

  // Build activity heatmap (last 30 days)
  const activityMap = new Map(studyLogs?.map(log => [log.study_date, log.minutes_studied || 0]) || [])
  const activityDays = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    activityDays.push({
      date,
      minutes: activityMap.get(date) || 0,
    })
  }

  // Calculate topic performance
  const topicPerformance = topics?.map(topic => {
    const topicFlashcards = (topic.flashcard_decks as { flashcards: { id: string }[] }[])?.flatMap(d => d.flashcards) || []
    const topicQuestionIds = (topic.questions as { id: string }[])?.map(q => q.id) || []

    const flashcardsStudied = flashcardProgress?.filter(p => 
      topicFlashcards.some(f => f.id === p.confidence_level.toString()) // This needs to be fixed based on actual schema
    ).length || 0

    const questionsAnswered = questionProgress?.filter(p =>
      topicQuestionIds.includes(p.is_correct.toString()) // This needs to be fixed based on actual schema
    ).length || 0

    return {
      topic,
      totalContent: topicFlashcards.length + topicQuestionIds.length,
      progress: 0, // Placeholder
    }
  }).filter(t => t.totalContent > 0) || []

  return {
    streak,
    totalCards,
    masteredCards,
    totalQuestions,
    correctQuestions,
    accuracy,
    simsCompleted,
    avgSimScore,
    totalMinutes,
    activityDays,
    topicPerformance,
    studyLogs: studyLogs || [],
  }
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const data = await getProgressData(user.id)

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Progress</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning journey and identify areas for improvement
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
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
              <p className="text-xs text-muted-foreground">Cards Mastered</p>
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
              <p className="text-xs text-muted-foreground">Question Accuracy</p>
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
              <p className="text-xs text-muted-foreground">Total Study Time</p>
            </div>
          </div>
        </GlassCard>
      </div>

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
                "w-4 h-4 rounded-sm transition-colors",
                day.minutes === 0 && "bg-secondary",
                day.minutes > 0 && day.minutes < 15 && "bg-primary/30",
                day.minutes >= 15 && day.minutes < 30 && "bg-primary/50",
                day.minutes >= 30 && day.minutes < 60 && "bg-primary/70",
                day.minutes >= 60 && "bg-primary"
              )}
              title={`${day.date}: ${day.minutes} minutes`}
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
                <span className="text-muted-foreground">Cards Studied</span>
                <span className="text-foreground">{data.totalCards}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Mastered (Level 4+)</span>
                <span className="text-success">{data.masteredCards}</span>
              </div>
              <Progress value={data.totalCards > 0 ? (data.masteredCards / data.totalCards) * 100 : 0} className="h-2" />
            </div>
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
                <span className="text-muted-foreground">Correct Answers</span>
                <span className="text-success">{data.correctQuestions}</span>
              </div>
              <Progress value={data.accuracy} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              Accuracy: <span className={cn(
                "font-medium",
                data.accuracy >= 70 ? "text-success" : data.accuracy >= 50 ? "text-warning" : "text-destructive"
              )}>{data.accuracy}%</span>
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
              <Progress value={data.avgSimScore} className="h-2" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Achievements */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-warning" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <AchievementBadge 
            title="First Steps" 
            description="Complete your first study session"
            unlocked={data.studyLogs.length > 0}
          />
          <AchievementBadge 
            title="Week Warrior" 
            description="7 day study streak"
            unlocked={data.streak >= 7}
          />
          <AchievementBadge 
            title="Card Master" 
            description="Master 50 flashcards"
            unlocked={data.masteredCards >= 50}
          />
          <AchievementBadge 
            title="Sharp Mind" 
            description="80% question accuracy"
            unlocked={data.accuracy >= 80}
          />
        </div>
      </GlassCard>
    </div>
  )
}

function AchievementBadge({ title, description, unlocked }: { 
  title: string
  description: string
  unlocked: boolean 
}) {
  return (
    <div className={cn(
      "p-4 rounded-lg border text-center transition-all",
      unlocked 
        ? "bg-warning/10 border-warning/30" 
        : "bg-secondary/30 border-transparent opacity-50"
    )}>
      <Award className={cn(
        "w-8 h-8 mx-auto mb-2",
        unlocked ? "text-warning" : "text-muted-foreground"
      )} />
      <p className={cn(
        "font-medium text-sm",
        unlocked ? "text-foreground" : "text-muted-foreground"
      )}>{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}
