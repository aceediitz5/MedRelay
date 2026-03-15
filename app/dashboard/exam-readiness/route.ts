import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("program_type")
      .eq("id", user.id)
      .single()

    const userTrack = profile?.program_type || ""

    let selectedExam = EXAM_CONFIGS[0]
    if (userTrack?.includes("nurs")) selectedExam = EXAM_CONFIGS[2]
    else if (userTrack?.includes("med") || userTrack?.includes("pre")) selectedExam = EXAM_CONFIGS[3]
    else if (userTrack?.includes("para")) selectedExam = EXAM_CONFIGS[1]

    const { data: topics } = await supabase
      .from("topics")
      .select("id, name")

    const { data: questionProgress } = await supabase
      .from("user_question_progress")
      .select("is_correct, questions(topic_id)")
      .eq("user_id", user.id)

    const { data: flashcardProgress } = await supabase
      .from("user_flashcard_progress")
      .select("times_reviewed, flashcards(topic_id)")
      .eq("user_id", user.id)

    const { data: caseProgress } = await supabase
      .from("user_case_progress")
      .select("completed, score")
      .eq("user_id", user.id)

    const topicStats: Record<string, { correct: number; total: number; cards: number }> = {}
    topics?.forEach((t) => {
      topicStats[t.name] = { correct: 0, total: 0, cards: 0 }
    })

    questionProgress?.forEach((qp) => {
      const topicId = (qp.questions as { topic_id: string } | null)?.topic_id
      const topic = topics?.find((t) => t.id === topicId)
      if (topic && topicStats[topic.name]) {
        topicStats[topic.name].total++
        if (qp.is_correct) topicStats[topic.name].correct++
      }
    })

    flashcardProgress?.forEach((fp) => {
      const topicId = (fp.flashcards as { topic_id: string } | null)?.topic_id
      const topic = topics?.find((t) => t.id === topicId)
      if (topic && topicStats[topic.name]) {
        topicStats[topic.name].cards += fp.times_reviewed || 0
      }
    })

    const topicReadiness = selectedExam.topics.map((topicName) => {
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

    const avgAccuracy =
      topicReadiness.length > 0
        ? Math.round(topicReadiness.reduce((acc, t) => acc + t.accuracy, 0) / topicReadiness.length)
        : 0

    const totalQuestions = questionProgress?.length || 0
    const volumeFactor = Math.min(totalQuestions / 100, 1)
    const readinessScore = Math.round(avgAccuracy * 0.7 + volumeFactor * 30)

    const passProbability = Math.min(
      Math.max(readinessScore + topicReadiness.filter((t) => t.isReady).length * 3 - 10, 0),
      99
    )

    const weakestTopics = topicReadiness
      .filter((t) => !t.isReady)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3)

    const completedCases = caseProgress?.filter((c) => c.completed)?.length || 0
    const avgCaseScore =
      caseProgress?.filter((c) => c.completed)?.reduce((acc, c) => acc + (c.score || 0), 0) /
        (completedCases || 1) || 0

    return NextResponse.json({
      selectedExam,
      topicReadiness,
      readinessScore,
      passProbability,
      weakestTopics,
      totalQuestions,
      completedCases,
      avgCaseScore: Math.round(avgCaseScore),
      allExams: EXAM_CONFIGS,
    })
  } catch (error) {
    console.error("Exam readiness detail error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
