"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  Target,
  AlertCircle,
  CheckCircle,
  BookOpen,
  HelpCircle,
  Award,
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

interface TopicReadiness {
  name: string
  accuracy: number
  questionsAnswered: number
  cardsReviewed: number
  isReady: boolean
}

interface ReadinessData {
  selectedExam: ExamConfig
  topicReadiness: TopicReadiness[]
  readinessScore: number
  passProbability: number
  weakestTopics: TopicReadiness[]
  totalQuestions: number
  completedCases: number
  avgCaseScore: number
  allExams: ExamConfig[]
}

export default function ExamReadinessPage() {
  const [data, setData] = useState<ReadinessData | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await fetch("/api/exam-readiness/detail", { cache: "no-store" })
        if (!res.ok) return
        const json = await res.json()
        if (active) setData(json)
      } catch {
        // no-op
      }
    }

    load()
    const id = setInterval(load, 30000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  if (!data) return null

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
