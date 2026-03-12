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
  Stethoscope,
  Heart,
  Activity,
  Thermometer,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SimulationProgress {
  id: string
  status: string
  current_step: number
  responses: Record<string, unknown>
  score: number | null
  started_at: string
  completed_at: string | null
}

interface Simulation {
  id: string
  title: string
  description: string | null
  difficulty: string
  estimated_minutes: number | null
  scenario_data: {
    patient_info: {
      age: number
      gender: string
      chief_complaint: string
    }
    vitals: {
      heart_rate: number
      blood_pressure: string
      respiratory_rate: number
      temperature: number
      spo2: number
    }
    history: string
    steps: Array<{
      id: string
      prompt: string
      options: string[]
      correct_answer: number
      feedback: {
        correct: string
        incorrect: string
      }
    }>
  }
  topic: { id: string; name: string; icon: string | null } | null
}

interface CaseSimulationProps {
  simulation: Simulation
  progress: SimulationProgress | null
  userId: string
}

export function CaseSimulation({ simulation, progress, userId }: CaseSimulationProps) {
  const [currentStep, setCurrentStep] = useState(progress?.current_step || 0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [answers, setAnswers] = useState<Map<number, { selected: number; correct: boolean }>>(
    new Map(Object.entries(progress?.responses || {}).map(([k, v]) => [parseInt(k), v as { selected: number; correct: boolean }]))
  )
  const [isComplete, setIsComplete] = useState(progress?.status === "completed")

  if (!simulation.scenario_data) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      This simulation has no content yet.
    </div>
  )
}

const scenario = simulation.scenario_data
const steps = scenario.steps || []
  const currentQuestion = steps[currentStep]
  const progressPercent = steps.length > 0 ? Math.round(((currentStep + (showFeedback ? 1 : 0)) / steps.length) * 100) : 0

  const saveProgress = useCallback(async (
    stepIndex: number, 
    newAnswers: Map<number, { selected: number; correct: boolean }>,
    completed: boolean
  ) => {
    const supabase = createClient()
    const correctCount = Array.from(newAnswers.values()).filter(a => a.correct).length
    const score = completed ? Math.round((correctCount / steps.length) * 100) : null

    await supabase
      .from("user_simulation_progress")
      .upsert({
        user_id: userId,
        simulation_id: simulation.id,
        status: completed ? "completed" : "in_progress",
        current_step: stepIndex,
        responses: Object.fromEntries(newAnswers),
        score,
        started_at: progress?.started_at || new Date().toISOString(),
        completed_at: completed ? new Date().toISOString() : null,
      })

    if (completed) {
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
            simulations_completed: existingLog.simulations_completed + 1,
            minutes_studied: existingLog.minutes_studied + (simulation.estimated_minutes || 15),
          })
          .eq("id", existingLog.id)
      } else {
        await supabase
          .from("daily_study_log")
          .insert({
            user_id: userId,
            study_date: today,
            simulations_completed: 1,
            minutes_studied: simulation.estimated_minutes || 15,
          })
      }
    }
  }, [progress, simulation, steps.length, userId])

  const handleSelectAnswer = useCallback((index: number) => {
    if (showFeedback) return
    setSelectedAnswer(index)
  }, [showFeedback])

  const handleSubmit = useCallback(async () => {
    if (selectedAnswer === null || !currentQuestion) return

    const isCorrect = selectedAnswer === currentQuestion.correct_answer
    const newAnswers = new Map(answers)
    newAnswers.set(currentStep, { selected: selectedAnswer, correct: isCorrect })
    setAnswers(newAnswers)
    setShowFeedback(true)

    await saveProgress(currentStep, newAnswers, false)
  }, [selectedAnswer, currentQuestion, answers, currentStep, saveProgress])

  const handleNext = useCallback(async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      // Complete the simulation
      setIsComplete(true)
      await saveProgress(currentStep, answers, true)
    }
  }, [currentStep, steps.length, answers, saveProgress])

  const handleRestart = useCallback(async () => {
    setCurrentStep(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setAnswers(new Map())
    setIsComplete(false)

    const supabase = createClient()
    await supabase
      .from("user_simulation_progress")
      .delete()
      .eq("user_id", userId)
      .eq("simulation_id", simulation.id)
  }, [simulation.id, userId])

  const correctCount = Array.from(answers.values()).filter(a => a.correct).length
  const finalScore = steps.length > 0 ? Math.round((correctCount / steps.length) * 100) : 0

  if (isComplete) {
    return (
      <div className="space-y-8 pt-12 lg:pt-0 max-w-3xl mx-auto">
        <Link href="/dashboard/simulations" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </Link>

        <GlassCard className="text-center py-12" glow>
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Case Complete!</h2>
          <p className="text-muted-foreground mb-6">{simulation.title}</p>

          <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{steps.length}</p>
              <p className="text-sm text-muted-foreground">Steps</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{correctCount}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <p className={cn(
                "text-3xl font-bold",
                finalScore >= 70 ? "text-success" : finalScore >= 50 ? "text-warning" : "text-destructive"
              )}>
                {finalScore}%
              </p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link href="/dashboard/simulations">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                More Cases
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/simulations" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {simulation.estimated_minutes || 15} min
        </div>
      </div>

      {/* Title and Progress */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {simulation.topic && <span className="text-xl">{simulation.topic.icon || "🏥"}</span>}
          <h1 className="text-2xl font-bold text-foreground">{simulation.title}</h1>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
      </div>

      {/* Patient Info Card */}
      {currentStep === 0 && !showFeedback && (
        <GlassCard>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Patient Presentation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Patient</p>
              <p className="text-foreground">{scenario.patient_info.age} year old {scenario.patient_info.gender}</p>
              <p className="text-sm text-muted-foreground mt-3 mb-1">Chief Complaint</p>
              <p className="text-foreground">{scenario.patient_info.chief_complaint}</p>
              {scenario.history && (
                <>
                  <p className="text-sm text-muted-foreground mt-3 mb-1">History</p>
                  <p className="text-foreground text-sm">{scenario.history}</p>
                </>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Vital Signs</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <Heart className="w-4 h-4 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">HR</p>
                    <p className="font-medium text-foreground">{scenario.vitals.heart_rate} bpm</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <Activity className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">BP</p>
                    <p className="font-medium text-foreground">{scenario.vitals.blood_pressure}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <Activity className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">RR</p>
                    <p className="font-medium text-foreground">{scenario.vitals.respiratory_rate}/min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <Thermometer className="w-4 h-4 text-warning" />
                  <div>
                    <p className="text-xs text-muted-foreground">Temp</p>
                    <p className="font-medium text-foreground">{scenario.vitals.temperature}°F</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                <Activity className="w-4 h-4 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">SpO2</p>
                  <p className="font-medium text-foreground">{scenario.vitals.spo2}%</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Current Step Question */}
      {currentQuestion && (
        <GlassCard>
          <p className="text-lg text-foreground mb-6">{currentQuestion.prompt}</p>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrect = index === currentQuestion.correct_answer
              const showResult = showFeedback

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all",
                    showResult && isCorrect && "bg-success/20 border-success",
                    showResult && isSelected && !isCorrect && "bg-destructive/20 border-destructive",
                    !showResult && isSelected && "bg-primary/20 border-primary",
                    !showResult && !isSelected && "bg-secondary/30 border-transparent hover:bg-secondary/50",
                    showFeedback && "cursor-default"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                      showResult && isCorrect && "bg-success text-white",
                      showResult && isSelected && !isCorrect && "bg-destructive text-white",
                      !showResult && isSelected && "bg-primary text-primary-foreground",
                      !showResult && !isSelected && "bg-muted text-muted-foreground"
                    )}>
                      {showResult ? (
                        isCorrect ? <CheckCircle className="w-4 h-4" /> : 
                        isSelected ? <AlertCircle className="w-4 h-4" /> : 
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

          {/* Feedback */}
          {showFeedback && (
            <div className={cn(
              "mt-6 p-4 rounded-lg border",
              selectedAnswer === currentQuestion.correct_answer 
                ? "bg-success/10 border-success/30" 
                : "bg-destructive/10 border-destructive/30"
            )}>
              <p className={cn(
                "font-medium mb-2",
                selectedAnswer === currentQuestion.correct_answer ? "text-success" : "text-destructive"
              )}>
                {selectedAnswer === currentQuestion.correct_answer ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-muted-foreground text-sm">
                {selectedAnswer === currentQuestion.correct_answer 
                  ? currentQuestion.feedback.correct 
                  : currentQuestion.feedback.incorrect}
              </p>
            </div>
          )}
        </GlassCard>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        {!showFeedback ? (
          <Button 
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {currentStep < steps.length - 1 ? (
              <>Next Step <ChevronRight className="w-4 h-4 ml-1" /></>
            ) : (
              "Complete Case"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
