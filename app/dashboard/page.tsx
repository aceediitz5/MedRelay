"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LiveReadinessCard } from "@/components/exam-readiness/live-readiness-card"
import { LimitBanner } from "@/components/subscription/limit-banner"
import { useSubscription } from "@/lib/subscription/context"
import {
  BookOpen,
  CheckCircle,
  Shield,
  Target,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ReadinessSummary = {
  accuracy: number
  confidenceLow: number
  confidenceHigh: number
  totalAttempts: number
  weakTopics: string[]
}

type UsageSummary = {
  flashcardsUsed?: number
  flashcardsLimit?: number
  questionsUsed?: number
  questionsLimit?: number
  simulationsUsed?: number
  simulationsLimit?: number
  studiedToday?: boolean
}

const EXAM_PACKAGES = [
  { id: "nremt", name: "NREMT Certification Prep" },
  { id: "paramedic", name: "Paramedic Certification Prep" },
  { id: "nclex", name: "NCLEX Nursing Prep" },
  { id: "mcat", name: "MCAT Foundations" },
  { id: "usmle", name: "USMLE Step 1 Prep" },
]

export default function DashboardPage() {
  const { isPro } = useSubscription()
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null)
  const [purchasedExamIds, setPurchasedExamIds] = useState<string[]>([])
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const [readinessRes, purchasesRes, usageRes] = await Promise.all([
          fetch("/api/exam-readiness/summary", { cache: "no-store" }),
          fetch("/api/user-purchases", { cache: "no-store" }),
          fetch("/api/usage/summary").catch(() => null),
        ])

        if (readinessRes.ok) {
          const data = (await readinessRes.json()) as ReadinessSummary
          if (isMounted) setReadiness(data)
        }

        if (purchasesRes.ok) {
          const data = await purchasesRes.json()
          if (isMounted) setPurchasedExamIds(data.purchasedExamIds || [])
        }

        if (usageRes && usageRes.ok) {
          const data = (await usageRes.json()) as UsageSummary
          if (isMounted) setUsage(data)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, 30000)
    return () => {
      isMounted = false
      clearInterval(id)
    }
  }, [])

  const unlockedExamPacks = useMemo(() => {
    return EXAM_PACKAGES.filter((p) => purchasedExamIds.includes(p.id))
  }, [purchasedExamIds])

  const readinessScore = readiness ? Math.round(readiness.accuracy) : 0
  const confidenceLow = readiness ? Math.round(readiness.confidenceLow) : 0
  const confidenceHigh = readiness ? Math.round(readiness.confidenceHigh) : 0

  const dailyLimitReached =
    Boolean(usage?.flashcardsLimit && usage.flashcardsUsed && usage.flashcardsUsed >= usage.flashcardsLimit) ||
    Boolean(usage?.questionsLimit && usage.questionsUsed && usage.questionsUsed >= usage.questionsLimit) ||
    Boolean(usage?.simulationsLimit && usage.simulationsUsed && usage.simulationsUsed >= usage.simulationsLimit)

  const showStreakProtection = usage ? !usage.studiedToday : false

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Keep your momentum going. Your plan and progress live here.
          </p>
        </div>
        <Link href="/dashboard/exam-prep">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Zap className="w-4 h-4 mr-2" />
            Start Today’s Plan
          </Button>
        </Link>
      </div>

      <LimitBanner
        limitReached={dailyLimitReached}
        message="Daily practice limit reached. Upgrade to keep going."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Exam Readiness Snapshot</h2>
              <p className="text-sm text-muted-foreground">
                Based on your correctness rate and recent activity.
              </p>
            </div>
            <Link href="/dashboard/exam-readiness">
              <Button variant="ghost" className="text-primary">
                View details
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Readiness</span>
                <span className="text-foreground font-medium">
                  {readiness ? `${readinessScore}%` : "--"}
                </span>
              </div>
              <Progress value={readinessScore} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Confidence interval: {readiness ? `${confidenceLow}% - ${confidenceHigh}%` : "--"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Weak Topics</p>
              <div className="flex flex-wrap gap-2">
                {(readiness?.weakTopics || []).slice(0, 4).map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">
                    {t}
                  </span>
                ))}
                {readiness && readiness.weakTopics.length === 0 && (
                  <span className="text-xs text-muted-foreground">No weak topics yet</span>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Unlocked Exam Packs</h2>
              <p className="text-sm text-muted-foreground">
                Packages you own with lifetime access.
              </p>
            </div>
            <Link href="/dashboard/exam-packages">
              <Button variant="ghost" className="text-primary">
                View all
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {unlockedExamPacks.length > 0 ? (
              unlockedExamPacks.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-foreground">{p.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No exam packs unlocked yet.</p>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <LiveReadinessCard />
        </GlassCard>

        {showStreakProtection && (
          <GlassCard className="relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Streak Protection</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You haven’t studied today. Do a quick session to keep your streak alive.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/exam-prep">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Start a quick session
                </Button>
              </Link>
            </div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-warning/10 rounded-full blur-2xl pointer-events-none" />
          </GlassCard>
        )}
      </div>

      {!isPro && !loading && (
        <GlassCard className={cn("relative overflow-hidden border-primary/30 bg-primary/5")}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Upgrade for unlimited study</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Unlock unlimited questions, flashcards, and full analytics.
              </p>
            </div>
            <Link href="/dashboard/pricing">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Upgrade
              </Button>
            </Link>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
