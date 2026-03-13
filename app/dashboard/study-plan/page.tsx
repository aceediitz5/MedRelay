import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  BookOpen,
  HelpCircle,
  Stethoscope,
  Play,
  CheckCircle,
  Clock,
  Flame,
  Zap,
  Target,
  ArrowRight,
  Calendar,
  Brain,
} from "lucide-react"

async function getStudyPlanData(userId: string) {
  const supabase = await createClient()
  
  // Get user profile for streak and XP
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  // Get flashcards due today (spaced repetition)
  const today = new Date().toISOString().split("T")[0]
  const { data: dueFlashcards } = await supabase
    .from("user_flashcard_progress")
    .select(`
      *,
      flashcard:flashcards(id, question, answer, deck_id, topic_id)
    `)
    .eq("user_id", userId)
    .lte("next_review_date", today)
    .limit(20)

  // Get new flashcards user hasn't seen
  const { data: reviewedIds } = await supabase
    .from("user_flashcard_progress")
    .select("flashcard_id")
    .eq("user_id", userId)

  const reviewedFlashcardIds = reviewedIds?.map(r => r.flashcard_id) || []
  
  let newFlashcardsQuery = supabase
    .from("flashcards")
    .select("id, question, topic_id")
    .limit(10)
  
  if (reviewedFlashcardIds.length > 0) {
    // Only add NOT IN filter if there are reviewed cards
    newFlashcardsQuery = newFlashcardsQuery.not("id", "in", `(${reviewedFlashcardIds.join(",")})`)
  }
  
  const { data: newFlashcards } = await newFlashcardsQuery

  // Get recommended questions based on weak topics
  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select("question_id, is_correct, questions(topic_id)")
    .eq("user_id", userId)

  // Calculate weak topics
  const topicAccuracy: Record<string, { correct: number; total: number }> = {}
  questionProgress?.forEach(p => {
    const topicId = (p.questions as { topic_id: string } | null)?.topic_id
    if (topicId) {
      if (!topicAccuracy[topicId]) {
        topicAccuracy[topicId] = { correct: 0, total: 0 }
      }
      topicAccuracy[topicId].total++
      if (p.is_correct) topicAccuracy[topicId].correct++
    }
  })

  const weakTopicIds = Object.entries(topicAccuracy)
    .filter(([, stats]) => stats.total >= 3 && (stats.correct / stats.total) < 0.7)
    .map(([id]) => id)

  // Get questions from weak topics or random if no weak topics
  let recommendedQuestionsQuery = supabase
    .from("questions")
    .select("id, question_text, topic_id, difficulty_level")
    .limit(10)
  
  if (weakTopicIds.length > 0) {
    recommendedQuestionsQuery = recommendedQuestionsQuery.in("topic_id", weakTopicIds)
  }
  
  const { data: recommendedQuestions } = await recommendedQuestionsQuery

  // Get available case simulations
  const { data: completedCases } = await supabase
    .from("user_case_progress")
    .select("case_id")
    .eq("user_id", userId)
    .eq("completed", true)

  const completedCaseIds = completedCases?.map(c => c.case_id) || []

  let availableCasesQuery = supabase
    .from("case_simulations")
    .select("id, title, difficulty, topic_id")
    .limit(5)
  
  if (completedCaseIds.length > 0) {
    availableCasesQuery = availableCasesQuery.not("id", "in", `(${completedCaseIds.join(",")})`)
  }
  
  const { data: availableCases } = await availableCasesQuery

  // Get today's study log
  const { data: todayLog } = await supabase
    .from("daily_study_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("study_date", today)
    .single()

  return {
    profile,
    dueFlashcards: dueFlashcards || [],
    newFlashcards: newFlashcards || [],
    recommendedQuestions: recommendedQuestions || [],
    availableCases: availableCases || [],
    todayLog,
    weakTopicIds,
  }
}

export default async function StudyPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const data = await getStudyPlanData(user.id)
  
  const flashcardsReviewed = data.todayLog?.flashcards_reviewed || 0
  const questionsAnswered = data.todayLog?.questions_answered || 0
  const casesCompleted = data.todayLog?.cases_completed || 0
  const xpEarned = data.todayLog?.xp_earned || 0

  const dailyGoal = {
    flashcards: { target: 20, current: flashcardsReviewed },
    questions: { target: 10, current: questionsAnswered },
    cases: { target: 1, current: casesCompleted },
  }

  const totalProgress = Math.round(
    ((dailyGoal.flashcards.current / dailyGoal.flashcards.target) +
     (dailyGoal.questions.current / dailyGoal.questions.target) +
     (dailyGoal.cases.current / dailyGoal.cases.target)) / 3 * 100
  )

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study Plan</h1>
          <p className="text-muted-foreground mt-1">
            Your personalized daily learning tasks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/20 text-warning">
            <Flame className="w-5 h-5" />
            <span className="font-semibold">{data.profile?.study_streak || 0} day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Level {data.profile?.level || 1}</span>
          </div>
        </div>
      </div>

      {/* Today's Progress */}
      <GlassCard glow>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Today's Progress</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <Progress value={Math.min(totalProgress, 100)} className="h-3 mb-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{totalProgress}% complete</span>
              <span className="text-yellow-400 font-medium">+{xpEarned} XP earned today</span>
            </div>
          </div>
          <Link href="/dashboard/study">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px]">
              <Play className="w-5 h-5 mr-2" />
              Start Study Session
            </Button>
          </Link>
        </div>
      </GlassCard>

      {/* Daily Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Flashcards</h3>
                <p className="text-sm text-muted-foreground">Due for review</p>
              </div>
            </div>
            {dailyGoal.flashcards.current >= dailyGoal.flashcards.target ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <span className="text-lg font-bold text-foreground">
                {dailyGoal.flashcards.current}/{dailyGoal.flashcards.target}
              </span>
            )}
          </div>
          <Progress 
            value={Math.min((dailyGoal.flashcards.current / dailyGoal.flashcards.target) * 100, 100)} 
            className="h-2 mb-3"
          />
          <p className="text-sm text-muted-foreground">
            {data.dueFlashcards.length + data.newFlashcards.length} cards ready to study
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Questions</h3>
                <p className="text-sm text-muted-foreground">Practice problems</p>
              </div>
            </div>
            {dailyGoal.questions.current >= dailyGoal.questions.target ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <span className="text-lg font-bold text-foreground">
                {dailyGoal.questions.current}/{dailyGoal.questions.target}
              </span>
            )}
          </div>
          <Progress 
            value={Math.min((dailyGoal.questions.current / dailyGoal.questions.target) * 100, 100)} 
            className="h-2 mb-3"
          />
          <p className="text-sm text-muted-foreground">
            {data.recommendedQuestions.length} recommended questions
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Case Sims</h3>
                <p className="text-sm text-muted-foreground">Clinical scenarios</p>
              </div>
            </div>
            {dailyGoal.cases.current >= dailyGoal.cases.target ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <span className="text-lg font-bold text-foreground">
                {dailyGoal.cases.current}/{dailyGoal.cases.target}
              </span>
            )}
          </div>
          <Progress 
            value={Math.min((dailyGoal.cases.current / dailyGoal.cases.target) * 100, 100)} 
            className="h-2 mb-3"
          />
          <p className="text-sm text-muted-foreground">
            {data.availableCases.length} cases available
          </p>
        </GlassCard>
      </div>

      {/* Study Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flashcards Due */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Flashcards Due Today</h2>
            </div>
            <Link href="/dashboard/flashcards">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {data.dueFlashcards.length > 0 ? (
              data.dueFlashcards.slice(0, 5).map((progress) => {
                const flashcard = progress.flashcard as {
                  id: string
                  question: string
                  deck_id: string
                  topics: { name: string; icon: string } | null
                } | null
                if (!flashcard) return null
                return (
                  <Link
                    key={progress.id}
                    href={`/dashboard/flashcards/${flashcard.deck_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-sm">
                      {flashcard.topics?.icon || "📚"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{flashcard.question}</p>
                      <p className="text-xs text-muted-foreground">{flashcard.topics?.name || "General"}</p>
                    </div>
                    <Clock className="w-4 h-4 text-warning" />
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
                <p className="text-muted-foreground">No flashcards due! Check back later.</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Recommended Questions */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Recommended Practice</h2>
            </div>
            <Link href="/dashboard/questions">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {data.recommendedQuestions.length > 0 ? (
              data.recommendedQuestions.slice(0, 5).map((q) => {
                const topic = q.topics as { name: string; icon: string } | null
                return (
                  <Link
                    key={q.id}
                    href={`/dashboard/questions/practice?topic=${q.topic_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-sm">
                      {topic?.icon || "📝"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{q.question_text}</p>
                      <p className="text-xs text-muted-foreground">{topic?.name || "General"} - {q.difficulty_level}</p>
                    </div>
                    <Target className="w-4 h-4 text-accent" />
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-6">
                <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Answer more questions to get recommendations</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Available Case Simulations */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-success" />
            <h2 className="text-lg font-semibold text-foreground">Available Case Simulations</h2>
          </div>
          <Link href="/dashboard/simulations">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.availableCases.length > 0 ? (
            data.availableCases.map((sim) => {
              const topic = sim.topics as { name: string; icon: string } | null
              return (
                <Link
                  key={sim.id}
                  href={`/dashboard/simulations/${sim.id}`}
                  className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center text-lg">
                      {topic?.icon || "🏥"}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sim.difficulty === "hard" 
                        ? "bg-destructive/20 text-destructive" 
                        : sim.difficulty === "medium"
                        ? "bg-warning/20 text-warning"
                        : "bg-success/20 text-success"
                    }`}>
                      {sim.difficulty}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{sim.title}</h3>
                  <p className="text-sm text-muted-foreground">{topic?.name || "Clinical"}</p>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full text-center py-6">
              <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
              <p className="text-muted-foreground">All cases completed! Great work!</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
