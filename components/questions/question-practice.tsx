"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Trophy,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [answers, setAnswers] = useState<Map<string, { selected: number; correct: boolean }>>(new Map())
  const [sessionComplete, setSessionComplete] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? Math.round((answers.size / questions.length) * 100) : 0
  const correctAnswers = Array.from(answers.values()).filter(a => a.correct).length

  const handleSelectAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return // Already answered
    setSelectedAnswer(index)
  }, [selectedAnswer])

  const handleSubmitAnswer = useCallback(async () => {
    if (selectedAnswer === null || !currentQuestion) return

    const isCorrect = selectedAnswer === currentQuestion.correct_answer
    
    // Save progress
    const supabase = createClient()
    await supabase
      .from("user_question_progress")
      .upsert({
        user_id: userId,
        question_id: currentQuestion.id,
        is_correct: isCorrect,
        selected_answer: selectedAnswer,
        answered_at: new Date().toISOString(),
      })

    // Update daily log
    const today = new Date().toISOString().split("T")[0]
    const { data: existingLog } = await supabase
      .from("daily_study_log")
      .select("*")
      .eq("user_id", userId)
      .eq("study_date", today)
      .single()

    if (existingLog) {
      await supabase
        .from("daily_study_log")
        .update({
          questions_answered: existingLog.questions_answered + 1,
          minutes_studied: existingLog.minutes_studied + 2,
        })
        .eq("id", existingLog.id)
    } else {
      await supabase
        .from("daily_study_log")
        .insert({
          user_id: userId,
          study_date: today,
          questions_answered: 1,
          minutes_studied: 2,
        })
    }

    setAnswers(prev => new Map(prev).set(currentQuestion.id, { selected: selectedAnswer, correct: isCorrect }))
    setShowExplanation(true)
  }, [selectedAnswer, currentQuestion, userId])

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
      <div className="space-y-8 pt-12 lg:pt-0">
        <Link href="/dashboard/questions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Question Bank
        </Link>
        <GlassCard className="text-center py-12 max-w-xl mx-auto" glow>
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Practice Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You scored {correctAnswers} out of {answers.size} questions
          </p>
          
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
                {accuracy}%
              </p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Practice Again
            </Button>
            <Link href="/dashboard/questions">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Back to Questions
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
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

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{answers.size} answered</span>
          <span className="text-success">{correctAnswers} correct</span>
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
    </div>
  )
}
