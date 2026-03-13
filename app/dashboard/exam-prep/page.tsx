"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { UpgradeModal } from "@/components/subscription/upgrade-modal"
import { useSubscription } from "@/lib/subscription/context"
import {
  Ambulance,
  Hospital,
  Microscope,
  GraduationCap,
  Lock,
  Crown,
  Clock,
  BookOpen,
  HelpCircle,
  Stethoscope,
  FileText,
  ChevronRight,
  Star,
  Zap,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Exam prep programs
const examPrograms = [
  {
    id: "nremt",
    name: "NREMT Exam Prep",
    description: "Complete preparation for the National Registry EMT examination",
    icon: Ambulance,
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-400",
    difficulty: "Intermediate",
    duration: "8-12 weeks",
    topics: ["Patient Assessment", "Airway Management", "Cardiology", "Trauma", "EMS Operations", "Pharmacology"],
    phases: [
      { name: "Core Flashcards", items: 450, completed: 0 },
      { name: "Practice Questions", items: 600, completed: 0 },
      { name: "Case Simulations", items: 45, completed: 0 },
      { name: "Full Practice Exams", items: 5, completed: 0 },
    ],
  },
  {
    id: "paramedic",
    name: "Paramedic Certification Prep",
    description: "Advanced training for NREMT-P and state paramedic certifications",
    icon: Ambulance,
    color: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    difficulty: "Advanced",
    duration: "12-16 weeks",
    topics: ["Advanced Airway", "Cardiac Arrest", "Pharmacology", "Trauma Management", "Special Populations"],
    phases: [
      { name: "Core Flashcards", items: 650, completed: 0 },
      { name: "Practice Questions", items: 850, completed: 0 },
      { name: "Case Simulations", items: 60, completed: 0 },
      { name: "Full Practice Exams", items: 6, completed: 0 },
    ],
  },
  {
    id: "nclex",
    name: "NCLEX Nursing Prep",
    description: "Comprehensive NCLEX-RN and NCLEX-PN exam preparation",
    icon: Hospital,
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    iconColor: "text-pink-400",
    difficulty: "Intermediate",
    duration: "10-14 weeks",
    topics: ["Pharmacology", "Med-Surg", "Pediatrics", "Mental Health", "Maternal-Newborn", "Critical Care"],
    phases: [
      { name: "Core Flashcards", items: 800, completed: 0 },
      { name: "Practice Questions", items: 1000, completed: 0 },
      { name: "Case Simulations", items: 50, completed: 0 },
      { name: "Full Practice Exams", items: 8, completed: 0 },
    ],
  },
  {
    id: "mcat",
    name: "MCAT Foundations",
    description: "Build a strong foundation for medical school entrance",
    icon: Microscope,
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
    iconColor: "text-cyan-400",
    difficulty: "Advanced",
    duration: "16-20 weeks",
    topics: ["Biochemistry", "Biology", "Chemistry", "Physics", "Psychology", "Sociology"],
    phases: [
      { name: "Core Flashcards", items: 950, completed: 0 },
      { name: "Practice Questions", items: 1200, completed: 0 },
      { name: "Case Simulations", items: 40, completed: 0 },
      { name: "Full Practice Exams", items: 10, completed: 0 },
    ],
  },
  {
    id: "usmle",
    name: "USMLE Step 1 Foundations",
    description: "Comprehensive prep for the USMLE Step 1 examination",
    icon: GraduationCap,
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    difficulty: "Expert",
    duration: "20-24 weeks",
    topics: ["Anatomy", "Pathology", "Pharmacology", "Physiology", "Biochemistry", "Microbiology"],
    phases: [
      { name: "Core Flashcards", items: 1100, completed: 0 },
      { name: "Practice Questions", items: 1500, completed: 0 },
      { name: "Case Simulations", items: 80, completed: 0 },
      { name: "Full Practice Exams", items: 12, completed: 0 },
    ],
  },
]

const difficultyColors = {
  Intermediate: "text-primary bg-primary/20",
  Advanced: "text-warning bg-warning/20",
  Expert: "text-destructive bg-destructive/20",
}

function ExamProgramCard({ program, isPro }: { program: typeof examPrograms[0]; isPro: boolean }) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const Icon = program.icon
  const totalItems = program.phases.reduce((acc, phase) => acc + phase.items, 0)
  const completedItems = program.phases.reduce((acc, phase) => acc + phase.completed, 0)
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const handleStartPrep = () => {
    if (!isPro) {
      setUpgradeModalOpen(true)
    }
    // TODO: Navigate to program detail page when Pro
  }

  return (
    <>
      <GlassCard className={cn(
        "relative overflow-hidden transition-all duration-300",
        !isPro && "opacity-80"
      )}>
        {/* Locked badge for free users */}
        {!isPro && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/20 border border-warning/30 text-warning text-xs font-medium z-10">
            <Lock className="w-3 h-3" />
            <span>Pro</span>
          </div>
        )}

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br",
              program.color
            )}>
              <Icon className={cn("w-7 h-7", program.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg">{program.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              difficultyColors[program.difficulty as keyof typeof difficultyColors]
            )}>
              {program.difficulty}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {program.duration}
            </span>
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {program.topics.slice(0, 4).map((topic) => (
              <span key={topic} className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">
                {topic}
              </span>
            ))}
            {program.topics.length > 4 && (
              <span className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">
                +{program.topics.length - 4} more
              </span>
            )}
          </div>

          {/* Phases Preview */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {program.phases.map((phase, index) => {
              const icons = [BookOpen, HelpCircle, Stethoscope, FileText]
              const PhaseIcon = icons[index]
              return (
                <div key={phase.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <PhaseIcon className="w-3.5 h-3.5" />
                  <span>{phase.items} {phase.name.split(" ").pop()}</span>
                </div>
              )
            })}
          </div>

          {/* Progress */}
          {isPro && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto">
            <Button
              onClick={handleStartPrep}
              className={cn(
                "w-full",
                isPro
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              {isPro ? (
                <>
                  Start Prep <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock with Pro
                </>
              )}
            </Button>
          </div>
        </div>
      </GlassCard>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature="exam_prep"
      />
    </>
  )
}

export default function ExamPrepPage() {
  const { isPro, isLoading } = useSubscription()

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Exam Prep Center</h1>
            {isPro && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium">
                <Crown className="w-3 h-3" />
                Pro Access
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            Structured exam preparation programs designed to help you pass your certification
          </p>
        </div>
      </div>

      {/* Pro Banner for free users */}
      {!isPro && !isLoading && (
        <GlassCard className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Unlock All Exam Prep Programs</h3>
                <p className="text-sm text-muted-foreground">
                  Get full access to structured study paths, practice exams, and case simulations
                </p>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </GlassCard>
      )}

      {/* Program Phases Explanation */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          How Exam Prep Programs Work
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, phase: "Phase 1", name: "Core Flashcards", description: "Master fundamental concepts" },
            { icon: HelpCircle, phase: "Phase 2", name: "Practice Questions", description: "Test your knowledge" },
            { icon: Stethoscope, phase: "Phase 3", name: "Case Simulations", description: "Apply skills to scenarios" },
            { icon: FileText, phase: "Phase 4", name: "Practice Exams", description: "Simulate the real test" },
          ].map((item) => (
            <div key={item.phase} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.phase}</p>
                <p className="font-medium text-foreground text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Exam Programs Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-warning" />
          Available Programs
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {examPrograms.map((program) => (
            <ExamProgramCard key={program.id} program={program} isPro={isPro} />
          ))}
        </div>
      </div>
    </div>
  )
}
