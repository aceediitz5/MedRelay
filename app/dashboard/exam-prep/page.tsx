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
  Clock,
  BookOpen,
  HelpCircle,
  Stethoscope,
  FileText,
  ChevronRight,
  Star,
  Target,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Exam prep programs - independently purchasable
const examPrograms = [
  {
    id: "nremt",
    name: "NREMT Certification Prep",
    description: "Complete preparation for the National Registry EMT examination",
    icon: Ambulance,
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-400",
    difficulty: "Intermediate",
    duration: "8-12 weeks",
    price: 99,
    topics: ["Patient Assessment", "Airway Management", "Cardiology", "Trauma", "EMS Operations", "Pharmacology"],
    phases: [
      { name: "Core Flashcards", items: 150, completed: 0 },
      { name: "Practice Questions", items: 200, completed: 0 },
      { name: "Case Simulations", items: 15, completed: 0 },
      { name: "Full Practice Exams", items: 3, completed: 0 },
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
    price: 129,
    topics: ["Advanced Airway", "Cardiac Arrest", "Pharmacology", "Trauma Management", "Special Populations"],
    phases: [
      { name: "Core Flashcards", items: 200, completed: 0 },
      { name: "Practice Questions", items: 280, completed: 0 },
      { name: "Case Simulations", items: 20, completed: 0 },
      { name: "Full Practice Exams", items: 4, completed: 0 },
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
    price: 149,
    topics: ["Pharmacology", "Med-Surg", "Pediatrics", "Mental Health", "Maternal-Newborn", "Critical Care"],
    phases: [
      { name: "Core Flashcards", items: 250, completed: 0 },
      { name: "Practice Questions", items: 350, completed: 0 },
      { name: "Case Simulations", items: 18, completed: 0 },
      { name: "Full Practice Exams", items: 5, completed: 0 },
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
    price: 199,
    topics: ["Biochemistry", "Biology", "Chemistry", "Physics", "Psychology", "Sociology"],
    phases: [
      { name: "Core Flashcards", items: 300, completed: 0 },
      { name: "Practice Questions", items: 400, completed: 0 },
      { name: "Case Simulations", items: 12, completed: 0 },
      { name: "Full Practice Exams", items: 6, completed: 0 },
    ],
  },
  {
    id: "usmle",
    name: "USMLE Step 1 Prep",
    description: "Comprehensive prep for the USMLE Step 1 examination",
    icon: GraduationCap,
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    difficulty: "Expert",
    duration: "20-24 weeks",
    price: 249,
    topics: ["Anatomy", "Pathology", "Pharmacology", "Physiology", "Biochemistry", "Microbiology"],
    phases: [
      { name: "Core Flashcards", items: 350, completed: 0 },
      { name: "Practice Questions", items: 500, completed: 0 },
      { name: "Case Simulations", items: 25, completed: 0 },
      { name: "Full Practice Exams", items: 8, completed: 0 },
    ],
  },
]

const difficultyColors = {
  Intermediate: "text-primary bg-primary/20",
  Advanced: "text-warning bg-warning/20",
  Expert: "text-destructive bg-destructive/20",
}

function ExamProgramCard({ program, isPurchased }: { program: typeof examPrograms[0]; isPurchased: boolean }) {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const Icon = program.icon
  const totalItems = program.phases.reduce((acc, phase) => acc + phase.items, 0)
  const completedItems = program.phases.reduce((acc, phase) => acc + phase.completed, 0)
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const handleStartPrep = () => {
    if (!isPurchased) {
      setPurchaseModalOpen(true)
    }
    // TODO: Navigate to program detail page when purchased
  }

  return (
    <>
      <GlassCard className="relative overflow-hidden transition-all duration-300 hover:border-primary/30 card-hover">
        {/* Price badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-bold z-10">
          ${program.price}
        </div>

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
            <span className="flex items-center gap-1 text-xs text-primary font-medium">
              Lifetime Access
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
          {isPurchased && (
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
                "w-full h-11 btn-hover-lift",
                isPurchased
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              )}
            >
              {isPurchased ? (
                <>
                  Continue Prep <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Purchase for ${program.price} <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Purchase Modal */}
      <UpgradeModal
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        feature="exam_prep"
      />
    </>
  )
}

export default function ExamPrepPage() {
  const { isPro, isLoading } = useSubscription()
  // In a real app, this would come from Supabase tracking user purchases
  const purchasedPrograms: string[] = []

  return (
    <div className="space-y-8 pt-12 lg:pt-0 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Exam Prep Center</h1>
          </div>
          <p className="text-muted-foreground">
            Purchase individual exam prep packages. Each includes lifetime access to all materials.
          </p>
        </div>
      </div>

      {/* Value Proposition Banner */}
      <GlassCard className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">One-Time Purchase, Lifetime Access</h3>
              <p className="text-sm text-muted-foreground">
                Each exam prep package is independently purchasable. No subscriptions required.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>All materials included</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </GlassCard>

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
          Available Exam Prep Packages
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {examPrograms.map((program, index) => (
            <div key={program.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <ExamProgramCard 
                program={program} 
                isPurchased={purchasedPrograms.includes(program.id)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">Pricing Summary</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {examPrograms.map((program) => (
            <div key={program.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="text-sm text-foreground truncate">{program.name.replace(" Prep", "")}</span>
              <span className="text-sm font-bold text-primary ml-2">${program.price}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
