"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/lib/subscription/context"
import { UpgradeModal } from "@/components/subscription/upgrade-modal"
import {
  Flame,
  BookOpen,
  HelpCircle,
  Stethoscope,
  Trophy,
  ArrowRight,
  Check,
  Star,
  Zap,
  Target,
  Clock,
  ChevronRight,
  Play,
  Sparkles,
  Lock,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"

type StudyStep = "flashcards" | "questions" | "case" | "review"

interface DailyGoals {
  flashcardsTarget: number
  flashcardsCompleted: number
  questionsTarget: number
  questionsCompleted: number
  casesTarget: number
  casesCompleted: number
}

interface StudySession {
  id: string
  xpEarned: number
  flashcardsReviewed: number
  questionsAnswered: number
  casesCompleted: number
  accuracy: number
}

const STEPS: { id: StudyStep; label: string; icon: React.ElementType; description: string }[] = [
  { id: "flashcards", label: "Flashcards", icon: BookOpen, description: "Review spaced repetition cards" },
  { id: "questions", label: "Questions", icon: HelpCircle, description: "Practice clinical questions" },
  { id: "case", label: "Case Study", icon: Stethoscope, description: "Work through a scenario" },
  { id: "review", label: "Review", icon: Trophy, description: "See your progress" },
]

export default function DailyStudyPage() {
  const router = useRouter()
  const { isPro, dailyUsage, canUseFlashcards, canUseQuestions } = useSubscription()
  const [currentStep, setCurrentStep] = useState<StudyStep>("flashcards")
  const [completedSteps, setCompletedSteps] = useState<Set<StudyStep>>(new Set())
  const [streak, setStreak] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    flashcardsTarget: isPro ? 50 : 20,
    flashcardsCompleted: 0,
    questionsTarget: isPro ? 30 : 10,
    questionsCompleted: 0,
    casesTarget: isPro ? 3 : 1,
    casesCompleted: 0,
  })
  const [sessionXp, setSessionXp] = useState(0)

  useEffect(() => {
    async function loadUserProgress() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Load user profile with XP and streak
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, level, current_streak, longest_streak")
        .eq("id", user.id)
        .single()

      if (profile) {
        setTotalXp(profile.total_xp || 0)
        setLevel(profile.level || 1)
        setStreak(profile.current_streak || 0)
      }

      // Load today's progress
      const today = new Date().toISOString().split("T")[0]
      const { data: dailyLog } = await supabase
        .from("daily_study_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("study_date", today)
        .single()

      if (dailyLog) {
        setDailyGoals(prev => ({
          ...prev,
          flashcardsCompleted: dailyLog.flashcards_reviewed || 0,
          questionsCompleted: dailyLog.questions_answered || 0,
          casesCompleted: dailyLog.cases_completed || 0,
        }))
      }

      setLoading(false)
    }

    loadUserProgress()
  }, [router])

  const getCurrentStepIndex = () => STEPS.findIndex(s => s.id === currentStep)
  
  const overallProgress = () => {
    const flashcardPct = Math.min(100, (dailyGoals.flashcardsCompleted / dailyGoals.flashcardsTarget) * 100)
    const questionPct = Math.min(100, (dailyGoals.questionsCompleted / dailyGoals.questionsTarget) * 100)
    const casePct = Math.min(100, (dailyGoals.casesCompleted / dailyGoals.casesTarget) * 100)
    return Math.round((flashcardPct + questionPct + casePct) / 3)
  }

  const handleStartStep = (step: StudyStep) => {
    if (step === "flashcards") {
      if (!canUseFlashcards && !isPro) {
        setUpgradeModalOpen(true)
        return
      }
      router.push("/dashboard/flashcards")
    } else if (step === "questions") {
      if (!canUseQuestions && !isPro) {
        setUpgradeModalOpen(true)
        return
      }
      router.push("/dashboard/questions/practice")
    } else if (step === "case") {
      router.push("/dashboard/simulations")
    } else if (step === "review") {
      router.push("/dashboard/progress")
    }
  }

  const xpForNextLevel = level * 500
  const xpProgress = ((totalXp % 500) / 500) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pt-12 lg:pt-0 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daily Study Session</h1>
          <p className="text-muted-foreground mt-1">Complete your daily goals to maintain your streak</p>
        </div>
        
        {/* Streak Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-orange-400">{streak}</span>
            <span className="text-orange-400/80 text-sm">day streak</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">Lvl {level}</span>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-foreground">{totalXp.toLocaleString()} XP</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {xpForNextLevel - (totalXp % 500)} XP to Level {level + 1}
          </span>
        </div>
        <Progress value={xpProgress} className="h-3" />
        {sessionXp > 0 && (
          <p className="text-sm text-primary mt-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            +{sessionXp} XP earned this session!
          </p>
        )}
      </GlassCard>

      {/* Daily Goals Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span className="font-medium text-foreground">Flashcards</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {dailyGoals.flashcardsCompleted}/{dailyGoals.flashcardsTarget}
            </span>
          </div>
          <Progress 
            value={(dailyGoals.flashcardsCompleted / dailyGoals.flashcardsTarget) * 100} 
            className="h-2"
          />
          {dailyGoals.flashcardsCompleted >= dailyGoals.flashcardsTarget && (
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <Check className="w-4 h-4" />
              Complete!
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-foreground">Questions</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {dailyGoals.questionsCompleted}/{dailyGoals.questionsTarget}
            </span>
          </div>
          <Progress 
            value={(dailyGoals.questionsCompleted / dailyGoals.questionsTarget) * 100} 
            className="h-2"
          />
          {dailyGoals.questionsCompleted >= dailyGoals.questionsTarget && (
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <Check className="w-4 h-4" />
              Complete!
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-pink-400" />
              <span className="font-medium text-foreground">Case Studies</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {dailyGoals.casesCompleted}/{dailyGoals.casesTarget}
            </span>
          </div>
          <Progress 
            value={(dailyGoals.casesCompleted / dailyGoals.casesTarget) * 100} 
            className="h-2"
          />
          {dailyGoals.casesCompleted >= dailyGoals.casesTarget && (
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <Check className="w-4 h-4" />
              Complete!
            </div>
          )}
        </GlassCard>
      </div>

      {/* Overall Progress */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Today&apos;s Progress
          </h2>
          <span className="text-2xl font-bold text-primary">{overallProgress()}%</span>
        </div>
        <Progress value={overallProgress()} className="h-4" />
        {overallProgress() === 100 && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-green-400" />
            <div>
              <p className="font-semibold text-green-400">Daily Goals Complete!</p>
              <p className="text-sm text-green-400/80">You&apos;re maintaining your streak. Great work!</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Study Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Study Path</h2>
        
        <div className="grid gap-4">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(step.id)
            const isCurrent = currentStep === step.id
            const isLocked = !isPro && step.id === "case" && dailyGoals.casesCompleted >= 1
            
            let goalText = ""
            let progressValue = 0
            
            if (step.id === "flashcards") {
              goalText = `${dailyGoals.flashcardsCompleted}/${dailyGoals.flashcardsTarget} cards`
              progressValue = (dailyGoals.flashcardsCompleted / dailyGoals.flashcardsTarget) * 100
            } else if (step.id === "questions") {
              goalText = `${dailyGoals.questionsCompleted}/${dailyGoals.questionsTarget} questions`
              progressValue = (dailyGoals.questionsCompleted / dailyGoals.questionsTarget) * 100
            } else if (step.id === "case") {
              goalText = `${dailyGoals.casesCompleted}/${dailyGoals.casesTarget} cases`
              progressValue = (dailyGoals.casesCompleted / dailyGoals.casesTarget) * 100
            }

            return (
              <GlassCard
                key={step.id}
                className={cn(
                  "p-5 transition-all duration-300",
                  isCurrent && "ring-2 ring-primary/50",
                  isCompleted && "opacity-70"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    isCompleted ? "bg-green-500/20 text-green-400" :
                    isCurrent ? "bg-primary/20 text-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{step.label}</h3>
                      {step.id !== "review" && (
                        <span className="text-xs text-muted-foreground">({goalText})</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.id !== "review" && (
                      <Progress value={Math.min(100, progressValue)} className="h-1.5 mt-2 max-w-xs" />
                    )}
                  </div>
                  
                  <Button
                    onClick={() => handleStartStep(step.id)}
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    disabled={isLocked}
                    className={cn(
                      isLocked && "opacity-50"
                    )}
                  >
                    {isLocked ? (
                      <>
                        <Crown className="w-4 h-4 mr-1" />
                        Pro
                      </>
                    ) : isCompleted ? (
                      "Review"
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>

      {/* Pro Upgrade CTA for Free Users */}
      {!isPro && (
        <GlassCard className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Unlock Unlimited Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Get unlimited flashcards, questions, and case studies with Pro
                </p>
              </div>
            </div>
            <Button
              onClick={() => setUpgradeModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Upgrade to Pro <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </GlassCard>
      )}

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature="daily study"
      />
    </div>
  )
}
