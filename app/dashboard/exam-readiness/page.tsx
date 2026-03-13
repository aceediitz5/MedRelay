import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BookOpen,
  HelpCircle,
  Stethoscope,
  Award,
  ArrowRight,
  Brain,
  Sparkles,
  Shield,
} from "lucide-react"

interface ExamConfig {
  name: string
  slug: string
  topics: string[]
  passingScore: number
  description: string
}

const EXAM_CONFIGS: ExamConfig[] = [
  {
    name: "NREMT-B",
    slug: "nremt-b",
    topics: ["Patient Assessment", "Airway Management", "Trauma", "Medical Emergencies", "OB/GYN", "Pediatrics"],
    passingScore: 70,
    description: "National Registry EMT Basic Certification",
  },
  {
    name: "NREMT-P",
    slug: "nremt-p",
    topics: ["Advanced Airway", "Cardiology", "Pharmacology", "Trauma", "Medical Emergencies", "Pediatric Advanced"],
    passingScore: 70,
    description: "National Registry Paramedic Certification",
  },
  {
    name: "NCLEX-RN",
    slug: "nclex-rn",
    topics: ["Pharmacology", "Med-Surg", "Pediatrics", "Mental Health", "Maternal Health", "Leadership"],
    passingScore: 75,
    description: "Nursing Licensure Examination",
  },
  {
    name: "USMLE Step 1",
    slug: "usmle-1",
    topics: ["Anatomy", "Biochemistry", "Physiology", "Pathology", "Pharmacology", "Microbiology"],
    passingScore: 60,
    description: "United States Medical Licensing Examination",
  },
]

interface TopicReadiness {
  name: string
  accuracy: number
  questionsAnswered: number
  cardsReviewed: number
  isReady: boolean
}

async function getExamReadinessData(userId: string, userTrack: string) {
  const supabase = await createClient()

  // Determine which exam to show based on user track
  let selectedExam = EXAM_CONFIGS[0]
  if (userTrack?.includes("nurs")) selectedExam = EXAM_CONFIGS[2]
  else if (userTrack?.includes("med") || userTrack?.includes("pre")) selectedExam = EXAM_CONFIGS[3]
  else if (userTrack?.includes("para")) selectedExam = EXAM_CONFIGS[1]

  // Get all topics
  const { data: topics } = await supabase
    .from("topics")
    .select("id, name, icon")

  // Get question progress
  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select("is_correct, questions(topic_id)")
    .eq("user_id", userId)

  // Get flashcard progress
  const { data: flashcardProgress } = await supabase
    .from("user_flashcard_progress")
    .select("times_reviewed, flashcards(topic_id)")
    .eq("user_id", userId)

  // Get case progress
  const { data: caseProgress } = await supabase
    .from("user_case_progress")
    .select("completed, score")
    .eq("user_id", userId)

  // Calculate per-topic stats
  const topicStats: Record<string, { correct: number; total: number; cards: number }> = {}
  
  topics?.forEach(t => {
    topicStats[t.name] = { correct: 0, total: 0, cards: 0 }
  })

  questionProgress?.forEach(qp => {
    const topicId = (qp.questions as { topic_id: string } | null)?.topic_id
    const topic = topics?.find(t => t.id === topicId)
    if (topic && topicStats[topic.name]) {
      topicStats[topic.name].total++
      if (qp.is_correct) topicStats[topic.name].correct++
    }
  })

  flashcardProgress?.forEach(fp => {
    const topicId = (fp.flashcards as { topic_id: string } | null)?.topic_id
    const topic = topics?.find(t => t.id === topicId)
    if (topic && topicStats[topic.name]) {
      topicStats[topic.name].cards += fp.times_reviewed || 0
    }
  })

  // Calculate topic readiness for selected exam
  const topicReadiness: TopicReadiness[] = selectedExam.topics.map(topicName => {
    const stats = topicStats[topicName] || { correct: 0, total: 0, cards: 0 }
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    return {
      name: topicName,
      accuracy,
      questionsAnswered: stats.total,
      cardsReviewed: stats.cards,
      isReady: accuracy >= selectedExam.passingScore && stats.total >= 10,
    }
  })

  // Calculate overall readiness score
  const avgAccuracy = topicReadiness.length > 0
    ? Math.round(topicReadiness.reduce((acc, t) => acc + t.accuracy, 0) / topicReadiness.length)
    : 0

  // Adjust for question volume (need minimum practice)
  const totalQuestions = questionProgress?.length || 0
  const volumeFactor = Math.min(totalQuestions / 100, 1) // Max out at 100 questions
  const readinessScore = Math.round(avgAccuracy * 0.7 + volumeFactor * 30)

  // Calculate pass probability
  const passProbability = Math.min(
    Math.max(
      readinessScore + (topicReadiness.filter(t => t.isReady).length * 3) - 10,
      0
    ),
    99
  )

  // Get improvement recommendations
  const weakestTopics = topicReadiness
    .filter(t => !t.isReady)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)

  const completedCases = caseProgress?.filter(c => c.completed)?.length || 0
  const avgCaseScore = caseProgress?.filter(c => c.completed)?.reduce((acc, c) => acc + (c.score || 0), 0) / (completedCases || 1) || 0

  return {
    selectedExam,
    topicReadiness,
    readinessScore,
    passProbability,
    weakestTopics,
    totalQuestions,
    completedCases,
    avgCaseScore: Math.round(avgCaseScore),
    allExams: EXAM_CONFIGS,
  }
}

export default async function ExamReadinessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("program_type")
    .eq("id", user.id)
    .single()

  const data = await getExamReadinessData(user.id, profile?.program_type || "")

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exam Readiness</h1>
          <p className="text-muted-foreground mt-1">
            Track your preparation progress for certification exams
          </p>
        </div>
        <Link href="/dashboard/exam-prep">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Target className="w-4 h-4 mr-2" />
            Start Exam Prep
          </Button>
        </Link>
      </div>

      {/* Main Readiness Score */}
      <GlassCard glow className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{data.selectedExam.name}</h2>
                  <p className="text-sm text-muted-foreground">{data.selectedExam.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-3xl font-bold text-foreground">{data.totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Questions Practiced</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-3xl font-bold text-foreground">{data.completedCases}</p>
                  <p className="text-sm text-muted-foreground">Cases Completed</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-3xl font-bold text-foreground">{data.avgCaseScore}%</p>
                  <p className="text-sm text-muted-foreground">Avg Case Score</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-64 text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-secondary"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={`${data.readinessScore * 4.4} 440`}
                    strokeLinecap="round"
                    className={data.readinessScore >= 70 ? "text-success" : data.readinessScore >= 50 ? "text-warning" : "text-destructive"}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{data.readinessScore}%</span>
                  <span className="text-sm text-muted-foreground">Ready</span>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                data.passProbability >= 70 
                  ? "bg-success/20 text-success" 
                  : data.passProbability >= 50 
                  ? "bg-warning/20 text-warning" 
                  : "bg-destructive/20 text-destructive"
              }`}>
                <Shield className="w-4 h-4" />
                <span className="font-medium">{data.passProbability}% Pass Probability</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Topic Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Topic Readiness Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.topicReadiness.map((topic) => (
            <GlassCard key={topic.name} className={topic.isReady ? "border-success/30" : ""}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{topic.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {topic.questionsAnswered} questions answered
                  </p>
                </div>
                {topic.isReady ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-warning" />
                )}
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className={topic.accuracy >= data.selectedExam.passingScore ? "text-success" : "text-warning"}>
                    {topic.accuracy}%
                  </span>
                </div>
                <Progress 
                  value={topic.accuracy} 
                  className={`h-2 ${topic.accuracy >= data.selectedExam.passingScore ? "[&>div]:bg-success" : "[&>div]:bg-warning"}`}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {topic.cardsReviewed} flashcards reviewed | Need: {data.selectedExam.passingScore}% accuracy
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {data.weakestTopics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Improvement Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.weakestTopics.map((topic) => (
              <GlassCard key={topic.name} className="border-warning/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{topic.name}</h3>
                    <p className="text-sm text-warning">{topic.accuracy}% accuracy</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Focus on this topic to improve your overall readiness score.
                </p>
                <div className="flex gap-2">
                  <Link href="/dashboard/flashcards" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Cards
                    </Button>
                  </Link>
                  <Link href="/dashboard/questions" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <HelpCircle className="w-4 h-4 mr-1" />
                      Practice
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Other Exams */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Other Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.allExams.filter(e => e.slug !== data.selectedExam.slug).map((exam) => (
            <GlassCard key={exam.slug} hover>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Award className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{exam.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{exam.description}</p>
              <p className="text-xs text-muted-foreground">{exam.topics.length} topics covered</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
