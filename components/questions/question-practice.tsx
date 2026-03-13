"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/lib/subscription/context"
import { UpgradeModal } from "@/components/subscription/upgrade-modal"
import { UsageIndicator } from "@/components/subscription/locked-content"
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Trophy,
  BookOpen,
  Zap,
  Star,
  Lock,
  Crown,
  Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"

// XP rewards based on difficulty and correctness
const XP_REWARDS = {
  easy: { correct: 10, incorrect: 2 },
  medium: { correct: 20, incorrect: 5 },
  hard: { correct: 35, incorrect: 8 },
}

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string | null
  difficulty: string
  topic: { id: string; name: string; icon: string | null } | null
}

interface QuestionPracticeProps {
  questions: Question[]
  userId: string
  mode: string
}

export function QuestionPractice({ questions, userId, mode }: QuestionPracticeProps) {
  const { isPro, canUseQuestions, dailyUsage, refreshUsage } = useSubscription()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [answers, setAnswers] = useState<Map<string, { selected: number; correct: boolean }>>(new Map())
  const [sessionComplete, setSessionComplete] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [sessionXp, setSessionXp] = useState(0)
  const [showXpPopup, setShowXpPopup] = useState(false)
  const [lastXpGained, setLastXpGained] = useState(0)

  const currentQuestion = questions[currentIndex]

  if (!currentQuestion?.options) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        This question has no content yet.
      </div>
    )
  }
  const progress = questions.length > 0 ? Math.round((answers.size / questions.length) * 100) : 0
  const correctAnswers = Array.from(answers.values()).filter(a => a.correct).length

  const handleSelectAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return // Already answered
    setSelectedAnswer(index)
  }, [selectedAnswer])

  const handleSubmitAnswer = useCallback(async () => {
    if (selectedAnswer === null || !currentQuestion) return

    // Check usage limits
    if (!canUseQuestions && !isPro) {
      setUpgradeModalOpen(true)
      return
    }

    const isCorrect = selectedAnswer === currentQuestion.correct_answer
    const difficulty = (currentQuestion.difficulty || "medium") as keyof typeof XP_REWARDS
    const xpEarned = isCorrect 
      ? XP_REWARDS[difficulty].correct 
      : XP_REWARDS[difficulty].incorrect
    
    // Show XP popup
    setLastXpGained(xpEarned)
    setSessionXp(prev => prev + xpEarned)
    setShowXpPopup(true)
    setTimeout(() => setShowXpPopup(false), 1500)
    
    // Save progress
    const supabase = createClient()
    const options = ["a", "b", "c", "d"]
    await supabase
      .from("user_question_progress")
      .upsert({
        user_id: userId,
        question_id: currentQuestion.id,
        is_correct: isCorrect,
        selected_answer: options[selectedAnswer] || "a",
        answered_at: new Date().toISOString(),
      }, { onConflict: "user_id,question_id" })

    // Update daily log
    const today = new Date().toISOString().split("T")[0]
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
          questions_answered: (existingLog.questions_answered || 0) + 1,
          xp_earned: (existingLog.xp_earned || 0) + xpEarned,
        })
        .eq("id", existingLog.id)
    } else {
      await supabase
        .from("daily_study_logs")
        .insert({
          user_id: userId,
          study_date: today,
          questions_answered: 1,
          xp_earned: xpEarned,
        })
    }

    // Note: XP is tracked in daily_study_logs
    
    // Refresh usage counters
    await refreshUsage()

    setAnswers(prev => new Map(prev).set(currentQuestion.id, { selected: selectedAnswer, correct: isCorrect }))
    setShowExplanation(true)
  }, [selectedAnswer, currentQuestion, userId, canUseQuestions, isPro, refreshUsage])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setSessionComplete(true)
    }
  }, [currentIndex, questions.length])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setAnswers(new Map())
    setSessionComplete(false)
  }, [])

  if (questions.length === 0) {
    return (
      <div className="space-y-8 pt-12 lg:pt-0">
        <Link href="/dashboard/questions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Question Bank
        </Link>
        <GlassCard className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No questions available</h3>
          <p className="text-muted-foreground mb-6">
            {mode === "weak" 
              ? "Great job! You haven't missed any questions yet." 
              : mode === "new"
              ? "You've answered all available questions!"
              : "No questions found. Check back later for new content."}
          </p>
          <Link href="/dashboard/questions">
            <Button>Back to Question Bank</Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = answers.size > 0 ? Math.round((correctAnswers / answers.size) * 100) : 0
    return (
      <div className="space-y-8 pt-12 lg:pt-0 max-w-xl mx-auto">
        <Link href="/dashboard/questions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Question Bank
        </Link>
        <GlassCard className="text-center py-12" glow>
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Practice Complete!</h2>
          <p className="text-muted-foreground mb-4">
            You scored {correctAnswers} out of {answers.size} questions
          </p>
          
          {/* XP Summary */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400">+{sessionXp} XP</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">{accuracy}% Acc</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{answers.size}</p>
              <p className="text-sm text-muted-foreground">Attempted</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{correctAnswers}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <p className={cn("text-3xl font-bold", accuracy >= 70 ? "text-success" : accuracy >= 50 ? "text-warning" : "text-destructive")}>
                {answers.size - correctAnswers}
              </p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Practice Again
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
        <Link href="/dashboard/questions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Daily Usage Indicator for Free Users */}
      {!isPro && (
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Daily Question Limit
            </span>
            {!canUseQuestions && (
              <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Limit Reached
              </span>
            )}
          </div>
          <UsageIndicator
            used={dailyUsage.questionsAnswered}
            limit={10}
            label="Questions answered today"
            isPro={isPro}
          />
          {!canUseQuestions && (
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

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{answers.size} answered</span>
            <span className="text-success">{correctAnswers} correct</span>
          </div>
          {sessionXp > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-4 h-4" />
              <span className="font-medium">+{sessionXp} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Question Card */}
      <GlassCard>
        {/* Topic badge */}
        {currentQuestion.topic && (
          <div className="flex items-center gap-2 mb-4">
            <span>{currentQuestion.topic.icon || "📚"}</span>
            <span className="text-sm text-muted-foreground">{currentQuestion.topic.name}</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full ml-auto",
              currentQuestion.difficulty === "hard" ? "bg-destructive/20 text-destructive" :
              currentQuestion.difficulty === "medium" ? "bg-warning/20 text-warning" :
              "bg-success/20 text-success"
            )}>
              {currentQuestion.difficulty}
            </span>
          </div>
        )}

        {/* Question text */}
        <p className="text-lg text-foreground mb-6">{currentQuestion.question_text}</p>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion.correct_answer
            const showResult = showExplanation

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showExplanation}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  showResult && isCorrect && "bg-success/20 border-success",
                  showResult && isSelected && !isCorrect && "bg-destructive/20 border-destructive",
                  !showResult && isSelected && "bg-primary/20 border-primary",
                  !showResult && !isSelected && "bg-secondary/30 border-transparent hover:bg-secondary/50",
                  showExplanation && "cursor-default"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    showResult && isCorrect && "bg-success text-success-foreground",
                    showResult && isSelected && !isCorrect && "bg-destructive text-destructive-foreground",
                    !showResult && isSelected && "bg-primary text-primary-foreground",
                    !showResult && !isSelected && "bg-muted text-muted-foreground"
                  )}>
                    {showResult ? (
                      isCorrect ? <CheckCircle className="w-4 h-4" /> : 
                      isSelected ? <XCircle className="w-4 h-4" /> : 
                      String.fromCharCode(65 + index)
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span className="text-foreground">{option}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplanation && currentQuestion.explanation && (
          <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Explanation</span>
            </div>
            <p className="text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}
      </GlassCard>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        {!showExplanation ? (
          <Button 
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit Answer
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {currentIndex < questions.length - 1 ? (
              <>Next Question <ChevronRight className="w-4 h-4 ml-1" /></>
            ) : (
              "Finish Practice"
            )}
          </Button>
        )}
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
    </div>
    
    <UpgradeModal
      open={upgradeModalOpen}
      onOpenChange={setUpgradeModalOpen}
      feature="questions"
    />
    </>
  )
}
