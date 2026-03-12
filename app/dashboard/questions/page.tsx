import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HelpCircle, Target, CheckCircle, XCircle, Play, Filter } from "lucide-react"

async function getQuestionStats(userId: string) {
  const supabase = await createClient()
  
  // Get all questions
  const { data: questions } = await supabase
    .from("questions")
    .select(`
      *,
      topic:topics(id, name, icon)
    `)
    .order("created_at", { ascending: false })

  // Get user progress
  const { data: progress } = await supabase
    .from("user_question_progress")
    .select("*")
    .eq("user_id", userId)

  // Get topics for filtering
  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .order("name")

  const answered = progress?.length || 0
  const correct = progress?.filter(p => p.is_correct)?.length || 0
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0

  // Group by topic
  const topicStats = topics?.map(topic => {
    const topicQuestions = questions?.filter(q => (q.topic as { id: string } | null)?.id === topic.id) || []
    const topicProgress = progress?.filter(p => 
      topicQuestions.some(q => q.id === p.question_id)
    ) || []
    const topicCorrect = topicProgress.filter(p => p.is_correct).length

    return {
      topic,
      total: topicQuestions.length,
      answered: topicProgress.length,
      correct: topicCorrect,
      accuracy: topicProgress.length > 0 ? Math.round((topicCorrect / topicProgress.length) * 100) : 0
    }
  }).filter(t => t.total > 0) || []

  return {
    questions: questions || [],
    totalQuestions: questions?.length || 0,
    answered,
    correct,
    accuracy,
    topicStats,
    topics: topics || []
  }
}

export default async function QuestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const stats = await getQuestionStats(user.id)

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
          <p className="text-muted-foreground mt-1">
            Test your knowledge with practice questions
          </p>
        </div>
        <Link href="/dashboard/questions/practice">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" />
            Start Practice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.totalQuestions}</p>
            <p className="text-sm text-muted-foreground">Total Questions</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.answered}</p>
            <p className="text-sm text-muted-foreground">Answered</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.correct}</p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.accuracy}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
        </GlassCard>
      </div>

      {/* Practice by Topic */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Practice by Topic</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            {stats.topics.length} topics
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.topicStats.map(({ topic, total, answered, accuracy }) => (
            <Link key={topic.id} href={`/dashboard/questions/practice?topic=${topic.id}`}>
              <GlassCard hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{topic.icon || "📚"}</span>
                    <h3 className="font-semibold text-foreground">{topic.name}</h3>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                    {total} Qs
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{answered}/{total}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }}
                    />
                  </div>
                  {answered > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Accuracy: <span className={accuracy >= 70 ? "text-success" : accuracy >= 50 ? "text-warning" : "text-destructive"}>{accuracy}%</span>
                    </p>
                  )}
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Practice Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/questions/practice?mode=random">
          <GlassCard hover className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Random Mix</h3>
            <p className="text-sm text-muted-foreground">Practice questions from all topics</p>
          </GlassCard>
        </Link>
        <Link href="/dashboard/questions/practice?mode=weak">
          <GlassCard hover className="text-center">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Weak Areas</h3>
            <p className="text-sm text-muted-foreground">Focus on questions you missed</p>
          </GlassCard>
        </Link>
        <Link href="/dashboard/questions/practice?mode=new">
          <GlassCard hover className="text-center">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">New Questions</h3>
            <p className="text-sm text-muted-foreground">Questions you haven't tried yet</p>
          </GlassCard>
        </Link>
      </div>
    </div>
  )
}
