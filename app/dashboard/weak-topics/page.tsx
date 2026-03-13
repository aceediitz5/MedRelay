import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  Brain,
  RefreshCw,
} from "lucide-react"

interface TopicStats {
  topic_id: string
  topic_name: string
  topic_icon: string
  flashcards_reviewed: number
  questions_total: number
  questions_correct: number
  accuracy: number
  trend: "improving" | "declining" | "stable"
}

async function getWeakTopicsData(userId: string) {
  const supabase = await createClient()
  
  // Get all topics
  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, icon")

  // Get question progress by topic
  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select(`
      is_correct,
      answered_at,
      questions(topic_id)
    `)
    .eq("user_id", userId)
    .order("answered_at", { ascending: false })

  // Get flashcard progress by topic
  const { data: flashcardProgress } = await supabase
    .from("user_flashcard_progress")
    .select(`
      times_reviewed,
      flashcards(topic_id)
    `)
    .eq("user_id", userId)

  // Calculate stats per topic
  const topicStatsMap: Record<string, TopicStats> = {}

  topics?.forEach(topic => {
    topicStatsMap[topic.id] = {
      topic_id: topic.id,
      topic_name: topic.name,
      topic_icon: topic.icon || "📚",
      flashcards_reviewed: 0,
      questions_total: 0,
      questions_correct: 0,
      accuracy: 0,
      trend: "stable",
    }
  })

  // Aggregate flashcard data
  flashcardProgress?.forEach(fp => {
    const topicId = (fp.flashcards as { topic_id: string } | null)?.topic_id
    if (topicId && topicStatsMap[topicId]) {
      topicStatsMap[topicId].flashcards_reviewed += fp.times_reviewed || 0
    }
  })

  // Aggregate question data and calculate trends
  questionProgress?.forEach(qp => {
    const topicId = (qp.questions as { topic_id: string } | null)?.topic_id
    if (topicId && topicStatsMap[topicId]) {
      topicStatsMap[topicId].questions_total++
      if (qp.is_correct) {
        topicStatsMap[topicId].questions_correct++
      }
    }
  })

  // Calculate accuracy and determine weak topics
  const topicStats = Object.values(topicStatsMap)
    .map(stats => ({
      ...stats,
      accuracy: stats.questions_total > 0 
        ? Math.round((stats.questions_correct / stats.questions_total) * 100)
        : 0,
    }))
    .filter(stats => stats.questions_total >= 1) // Only show topics with data
    .sort((a, b) => a.accuracy - b.accuracy) // Sort by accuracy ascending (weakest first)

  // Separate weak and strong topics
  const weakTopics = topicStats.filter(t => t.accuracy < 70)
  const strongTopics = topicStats.filter(t => t.accuracy >= 70)

  return {
    weakTopics,
    strongTopics,
    allTopics: topicStats,
  }
}

export default async function WeakTopicsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const data = await getWeakTopicsData(user.id)

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Weak Topics</h1>
          <p className="text-muted-foreground mt-1">
            Identify areas that need improvement and focus your study efforts
          </p>
        </div>
        <Link href="/dashboard/questions">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <RefreshCw className="w-4 h-4 mr-2" />
            Practice All Topics
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.weakTopics.length}</p>
              <p className="text-sm text-muted-foreground">Topics Need Work</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.strongTopics.length}</p>
              <p className="text-sm text-muted-foreground">Topics Mastered</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {data.allTopics.length > 0 
                  ? Math.round(data.allTopics.reduce((acc, t) => acc + t.accuracy, 0) / data.allTopics.length)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Overall Accuracy</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Weak Topics */}
      {data.weakTopics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-semibold text-foreground">Topics Needing Improvement</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.weakTopics.map((topic) => (
              <TopicCard key={topic.topic_id} topic={topic} isWeak />
            ))}
          </div>
        </div>
      )}

      {/* Strong Topics */}
      {data.strongTopics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            <h2 className="text-xl font-semibold text-foreground">Mastered Topics</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.strongTopics.map((topic) => (
              <TopicCard key={topic.topic_id} topic={topic} isWeak={false} />
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {data.allTopics.length === 0 && (
        <GlassCard className="text-center py-12">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Performance Data Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start answering questions to see your topic performance breakdown and identify areas for improvement.
          </p>
          <Link href="/dashboard/questions">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <HelpCircle className="w-4 h-4 mr-2" />
              Start Practice Questions
            </Button>
          </Link>
        </GlassCard>
      )}
    </div>
  )
}

function TopicCard({ topic, isWeak }: { topic: TopicStats; isWeak: boolean }) {
  const accuracyColor = topic.accuracy < 50 
    ? "text-destructive" 
    : topic.accuracy < 70 
    ? "text-warning" 
    : "text-success"

  const progressColor = topic.accuracy < 50 
    ? "[&>div]:bg-destructive" 
    : topic.accuracy < 70 
    ? "[&>div]:bg-warning" 
    : "[&>div]:bg-success"

  return (
    <GlassCard className={isWeak ? "border-destructive/30" : ""}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
            {topic.topic_icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{topic.topic_name}</h3>
            <p className="text-sm text-muted-foreground">
              {topic.questions_total} questions attempted
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${accuracyColor}`}>{topic.accuracy}%</p>
          <p className="text-xs text-muted-foreground">accuracy</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Accuracy</span>
            <span className={accuracyColor}>{topic.questions_correct}/{topic.questions_total} correct</span>
          </div>
          <Progress value={topic.accuracy} className={`h-2 ${progressColor}`} />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {topic.flashcards_reviewed} cards reviewed
          </span>
          {topic.trend === "improving" && (
            <span className="flex items-center gap-1 text-success">
              <TrendingUp className="w-4 h-4" /> Improving
            </span>
          )}
          {topic.trend === "declining" && (
            <span className="flex items-center gap-1 text-destructive">
              <TrendingDown className="w-4 h-4" /> Needs work
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/dashboard/flashcards?topic=${topic.topic_id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            Review Cards
          </Button>
        </Link>
        <Link href={`/dashboard/questions/practice?topic=${topic.topic_id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <HelpCircle className="w-4 h-4 mr-2" />
            Practice
          </Button>
        </Link>
        <Link href={`/dashboard/simulations?topic=${topic.topic_id}`}>
          <Button variant="outline" size="sm">
            <Stethoscope className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </GlassCard>
  )
}
