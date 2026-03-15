"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp } from "lucide-react"

type ReadinessSummary = {
  accuracy: number
  readinessScore: number
  confidenceLow: number
  confidenceHigh: number
  weakTopics: { topic: string; incorrect: number }[]
  studiedToday: boolean
  dailyLimitReached: boolean
}

export function LiveReadinessCard() {
  const [data, setData] = useState<ReadinessSummary | null>(null)

  useEffect(() => {
    let isMounted = true
    let timer: NodeJS.Timeout | null = null

    const load = async () => {
      try {
        const res = await fetch("/api/exam-readiness/summary")
        if (!res.ok) return
        const json = (await res.json()) as ReadinessSummary
        if (isMounted) setData(json)
      } catch {
        // ignore
      }
    }

    load()
    timer = setInterval(load, 30000)

    return () => {
      isMounted = false
      if (timer) clearInterval(timer)
    }
  }, [])

  return (
    <GlassCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Live Exam Readiness</h3>
          <p className="text-sm text-muted-foreground">
            Updates automatically as you practice.
          </p>
        </div>
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Readiness</span>
            <span className="text-foreground font-medium">
              {data ? `${data.readinessScore}%` : "--"}
            </span>
          </div>
          <Progress value={data?.readinessScore || 0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Confidence: {data ? `${Math.round(data.confidenceLow * 100)}% - ${Math.round(data.confidenceHigh * 100)}%` : "--"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">Weak Topics</p>
          <div className="flex flex-wrap gap-2">
            {(data?.weakTopics || []).slice(0, 4).map((t) => (
              <span key={t.topic} className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">
                {t.topic}
              </span>
            ))}
            {data && data.weakTopics.length === 0 && (
              <span className="text-xs text-muted-foreground">No weak topics yet</span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
