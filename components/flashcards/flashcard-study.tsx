"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/lib/subscription/context"
import { UpgradeModal } from "@/components/subscription/upgrade-modal"
import { UsageIndicator } from "@/components/subscription/locked-content"
import {
  ArrowLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Sparkles,
  BookOpen,
  Lock,
  Crown,
  Zap,
  Flame,
  Star,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FlashcardProgress {
  flashcard_id: string
  difficulty: string
  times_reviewed: number
  last_reviewed_at: string
  next_review: string
}

interface Flashcard {
  id: string
  front_content: string
  back_content: string
  progress: FlashcardProgress | null
}

interface Deck {
  id: string
  title: string
  description: string | null
  topic: { id: string; name: string; icon: string | null } | null
}

interface FlashcardStudyProps {
  deck: Deck
  cards: Flashcard[]
  userId: string
}

const confidenceButtons = [
  { level: 1, label: "Again", icon: ThumbsDown, color: "text-destructive hover:bg-destructive/20" },
  { level: 2, label: "Hard", icon: Meh, color: "text-warning hover:bg-warning/20" },
  { level: 3, label: "Good", icon: ThumbsUp, color: "text-primary hover:bg-primary/20" },
  { level: 4, label: "Easy", icon: Sparkles, color: "text-success hover:bg-success/20" },
]

// SM-2 Spaced Repetition Algorithm
function calculateSM2(quality: number, easeFactor: number, interval: number, repetitions: number) {
  // quality: 0-5 (we map our 1-4 to 0-5)
  const q = Math.max(0, Math.min(5, (quality - 1) * 1.67))
  
  let newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEF = Math.max(1.3, newEF) // minimum ease factor
  
  let newInterval: number
  let newReps: number
  
  if (q < 3) {
    // Failed - reset
    newInterval = 1
    newReps = 0
  } else {
    newReps = repetitions + 1
    if (newReps === 1) {
      newInterval = 1
    } else if (newReps === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEF)
    }
  }
  
  return { easeFactor: newEF, interval: newInterval, repetitions: newReps }
}

// XP rewards based on confidence
const XP_REWARDS = {
  1: 5,   // Again - still learning
  2: 10,  // Hard - some effort
  3: 15,  // Good - solid recall
  4: 20,  // Easy - perfect recall
}

export function FlashcardStudy({ deck, cards, userId }: FlashcardStudyProps) {
  const router = useRouter()
  const { isPro, canUseFlashcards, dailyUsage, flashcardsRemaining, refreshUsage } = useSubscription()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set())
  const [sessionComplete, setSessionComplete] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [sessionXp, setSessionXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showXpPopup, setShowXpPopup] = useState(false)
  const [lastXpGained, setLastXpGained] = useState(0)

  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? Math.round((reviewedCards.size / cards.length) * 100) : 0

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped)
  }, [isFlipped])

  const handleConfidence = useCallback(async (level: number) => {
    if (!currentCard) return

    // Check if user has reached their daily limit
    if (!canUseFlashcards) {
      setUpgradeModalOpen(true)
      return
    }

    const supabase = createClient()
    const now = new Date()
    
    // Get current progress for SM-2 calculation
    const currentEF = (currentCard.progress as any)?.ease_factor || 2.5
    const currentInterval = (currentCard.progress as any)?.interval_days || 0
    const currentReps = (currentCard.progress as any)?.repetitions || 0
    
    // Calculate new SM-2 values
    const { easeFactor, interval, repetitions } = calculateSM2(level, currentEF, currentInterval, currentReps)
    const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000)

    // Calculate XP earned
    const xpEarned = XP_REWARDS[level as keyof typeof XP_REWARDS] || 10
    setLastXpGained(xpEarned)
    setSessionXp(prev => prev + xpEarned)
    setShowXpPopup(true)
    setTimeout(() => setShowXpPopup(false), 1500)

    // Upsert progress with SM-2 fields
    await supabase
      .from("user_flashcard_progress")
      .upsert({
        user_id: userId,
        flashcard_id: currentCard.id,
        difficulty: level === 1 ? "hard" : level === 2 ? "medium" : level === 3 ? "good" : "easy",
        times_reviewed: (currentCard.progress?.times_reviewed || 0) + 1,
        last_reviewed_at: now.toISOString(),
        next_review_date: nextReview.toISOString(),
        ease_factor: easeFactor,
        interval_days: interval,
        repetitions: repetitions,
      }, { onConflict: "user_id,flashcard_id" })

    // Update daily study log
    const today = now.toISOString().split("T")[0]
    const { data: existingLog } = await supabase
      .from("daily_study_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("study_date", today)
      .single()

    if (existingLog) {
      await supabase
        .from("daily_study_logs")
        .update({
          flashcards_reviewed: (existingLog.flashcards_reviewed || 0) + 1,
          xp_earned: (existingLog.xp_earned || 0) + xpEarned,
        })
        .eq("id", existingLog.id)
    } else {
      await supabase
        .from("daily_study_logs")
        .insert({
          user_id: userId,
          study_date: today,
          flashcards_reviewed: 1,
          xp_earned: xpEarned,
        })
    }

    // Note: XP is tracked in daily_study_logs, profile total_xp can be calculated from logs

    // Mark as reviewed and move to next card
    setReviewedCards(prev => new Set([...prev, currentCard.id]))
    setIsFlipped(false)

    // Refresh usage to update the counter
    await refreshUsage()

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setSessionComplete(true)
    }
  }, [currentCard, currentIndex, cards.length, userId, canUseFlashcards, refreshUsage])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }, [currentIndex])

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }, [currentIndex, cards.length])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setReviewedCards(new Set())
    setSessionComplete(false)
  }, [])

  if (cards.length === 0) {
    return (
      <div className="space-y-8 pt-12 lg:pt-0">
        <Link href="/dashboard/flashcards" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Decks
        </Link>
        <GlassCard className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No cards in this deck</h3>
          <p className="text-muted-foreground">This deck is empty. Check back later for new content.</p>
        </GlassCard>
      </div>
    )
  }

  if (sessionComplete) {
    return (
      <div className="space-y-8 pt-12 lg:pt-0 max-w-xl mx-auto">
        <Link href="/dashboard/flashcards" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Decks
        </Link>
        <GlassCard className="text-center py-12" glow>
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-6">
            {"You've reviewed all"} {cards.length} cards in this deck. Great work!
          </p>
          
          {/* XP Summary */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400">+{sessionXp} XP</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">{cards.length} Cards</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
            <Link href="/dashboard/study">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Daily Study
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <>
    <div className="space-y-6 pt-12 lg:pt-0 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/flashcards" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Decks
        </Link>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Daily Usage Indicator for Free Users */}
      {!isPro && (
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Daily Flashcard Limit
            </span>
            {!canUseFlashcards && (
              <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Limit Reached
              </span>
            )}
          </div>
          <UsageIndicator
            used={dailyUsage.flashcardsReviewed}
            limit={20}
            label="Cards reviewed today"
            isPro={isPro}
          />
          {!canUseFlashcards && (
            <Button
              onClick={() => setUpgradeModalOpen(true)}
              size="sm"
              className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade for Unlimited
            </Button>
          )}
        </div>
      )}

      {/* Deck title and progress */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {deck.topic && <span className="text-xl">{deck.topic.icon || "📚"}</span>}
          <h1 className="text-2xl font-bold text-foreground">{deck.title}</h1>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{reviewedCards.size} of {cards.length} reviewed this session</p>
          {sessionXp > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">+{sessionXp} XP this session</span>
            </div>
          )}
        </div>
      </div>
      
      {/* XP Popup Animation */}
      {showXpPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="animate-bounce flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-500/20 border border-yellow-500/30 backdrop-blur-sm">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">+{lastXpGained} XP</span>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <div 
        className="relative h-80 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div className={cn(
          "absolute inset-0 transition-transform duration-500 transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}>
          {/* Front */}
          <GlassCard className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden",
            isFlipped && "invisible"
          )}>
            <p className="text-xl text-foreground text-center whitespace-pre-wrap">
              {currentCard.front_content}
            </p>
            <div className="absolute bottom-4 flex items-center gap-2 text-muted-foreground text-sm">
              <Eye className="w-4 h-4" />
              Tap to reveal answer
            </div>
          </GlassCard>

          {/* Back */}
          <GlassCard className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180",
            !isFlipped && "invisible"
          )} glow>
            <p className="text-xl text-foreground text-center whitespace-pre-wrap">
              {currentCard.back_content}
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Navigation / Confidence buttons */}
      {!isFlipped ? (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleFlip}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Show Answer
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">How well did you know this?</p>
          <div className="grid grid-cols-4 gap-2">
            {confidenceButtons.map((btn) => (
              <Button
                key={btn.level}
                variant="ghost"
                className={cn("flex flex-col items-center gap-1 h-auto py-3", btn.color)}
                onClick={() => handleConfidence(btn.level)}
              >
                <btn.icon className="w-5 h-5" />
                <span className="text-xs">{btn.label}</span>
              </Button>
            ))}
          </div>
        </div>
)}
      </div>
    </div>
    
    <UpgradeModal
      open={upgradeModalOpen}
      onOpenChange={setUpgradeModalOpen}
      feature="flashcards"
    />
    </>
  )
}
