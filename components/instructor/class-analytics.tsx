"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Zap, BookOpen, HelpCircle, Stethoscope } from "lucide-react"

export function ClassAnalytics({ classId }: { classId: string }) {
  const [data, setData] = useState({
    students: 0,
    weeklyXp: 0,
    avgXp: 0,
    flashcards: 0,
    questions: 0,
    cases: 0,
  })

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await fetch(`/api/instructor/classes/${classId}/analytics`)
      if (!res.ok) return
      const payload = await res.json()
      setData(payload)
    }

    fetchAnalytics()
  }, [classId])

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <GlassCard className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Weekly XP</p>
          <p className="text-xl font-bold text-foreground">{data.weeklyXp}</p>
        </div>
      </GlassCard>
      <GlassCard className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-warning" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Flashcards</p>
          <p className="text-xl font-bold text-foreground">{data.flashcards}</p>
        </div>
      </GlassCard>
      <GlassCard className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Questions</p>
          <p className="text-xl font-bold text-foreground">{data.questions}</p>
        </div>
      </GlassCard>
      <GlassCard className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-success" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Cases</p>
          <p className="text-xl font-bold text-foreground">{data.cases}</p>
        </div>
      </GlassCard>
      <GlassCard className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Zap className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Avg XP / Student</p>
          <p className="text-xl font-bold text-foreground">{data.avgXp}</p>
        </div>
      </GlassCard>
      <GlassCard className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Zap className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Students</p>
          <p className="text-xl font-bold text-foreground">{data.students}</p>
        </div>
      </GlassCard>
    </div>
  )
}
