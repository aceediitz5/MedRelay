"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

// Plan limits
export const PLAN_LIMITS = {
  free: {
    flashcardsPerDay: 20,
    questionsPerDay: 10,
    canAccessSimulations: false, // Preview only
    canAccessExamPrep: false, // View only, can't start
    canAccessAnalytics: false,
    canAccessAllTopics: false,
  },
  pro: {
    flashcardsPerDay: Infinity,
    questionsPerDay: Infinity,
    canAccessSimulations: true,
    canAccessExamPrep: true,
    canAccessAnalytics: true,
    canAccessAllTopics: true,
  },
}

export type SubscriptionStatus = "free" | "pro"

interface DailyUsage {
  flashcardsReviewed: number
  questionsAnswered: number
  casesCompleted: number
}

interface SubscriptionContextType {
  status: SubscriptionStatus
  isPro: boolean
  isLoading: boolean
  dailyUsage: DailyUsage
  limits: typeof PLAN_LIMITS.free | typeof PLAN_LIMITS.pro
  canUseFlashcards: boolean
  canUseQuestions: boolean
  canUseSimulations: boolean
  canAccessExamPrep: boolean
  flashcardsRemaining: number
  questionsRemaining: number
  refreshUsage: () => Promise<void>
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SubscriptionStatus>("free")
  const [isLoading, setIsLoading] = useState(true)
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
    flashcardsReviewed: 0,
    questionsAnswered: 0,
    casesCompleted: 0,
  })

  const limits = status === "pro" ? PLAN_LIMITS.pro : PLAN_LIMITS.free
  const isPro = status === "pro"

  // Calculate remaining usage
  const flashcardsRemaining = Math.max(0, limits.flashcardsPerDay - dailyUsage.flashcardsReviewed)
  const questionsRemaining = Math.max(0, limits.questionsPerDay - dailyUsage.questionsAnswered)

  // Check if user can use features
  const canUseFlashcards = isPro || dailyUsage.flashcardsReviewed < limits.flashcardsPerDay
  const canUseQuestions = isPro || dailyUsage.questionsAnswered < limits.questionsPerDay
  const canUseSimulations = limits.canAccessSimulations
  const canAccessExamPrep = limits.canAccessExamPrep

  const refreshSubscription = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setStatus("free")
      setIsLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single()

    setStatus(profile?.is_pro ? "pro" : "free")
    setIsLoading(false)
  }

  const refreshUsage = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const today = new Date().toISOString().split("T")[0]
    
    const { data: log } = await supabase
      .from("daily_study_logs")
      .select("flashcards_reviewed, questions_answered, cases_completed")
      .eq("user_id", user.id)
      .eq("study_date", today)
      .single()

    if (log) {
      setDailyUsage({
        flashcardsReviewed: log.flashcards_reviewed || 0,
        questionsAnswered: log.questions_answered || 0,
        casesCompleted: log.cases_completed || 0,
      })
    } else {
      setDailyUsage({
        flashcardsReviewed: 0,
        questionsAnswered: 0,
        casesCompleted: 0,
      })
    }
  }

  useEffect(() => {
    refreshSubscription()
    refreshUsage()
  }, [])

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        isPro,
        isLoading,
        dailyUsage,
        limits,
        canUseFlashcards,
        canUseQuestions,
        canUseSimulations,
        canAccessExamPrep,
        flashcardsRemaining,
        questionsRemaining,
        refreshUsage,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
