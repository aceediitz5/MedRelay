"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
    stripePriceId: "price_1TAcZiHTnaP0wMR8i8gXGLS1",
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
    stripePriceId: "price_1TAcb1HTnaP0wMR8B1kztL3M",
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
    stripePriceId: "price_1TAcbMHTnaP0wMR8llyNupdV",
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
    stripePriceId: "price_1TAcbjHTnaP0wMR8vB1uQ9ZQ",
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
    stripePriceId: "price_1TAccWHTnaP0wMR8CiF5Z3Tk",
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

type SummaryCounts = {
  flashcards: number
  questions: number
  simulations: number
  practiceExams: number
}

export default function ExamPrepPage() {
  const [purchasedPrograms, setPurchasedPrograms] = useState<string[]>([])
  const [countsMap, setCountsMap] = useState<Record<string, SummaryCounts>>({})

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const res = await fetch("/api/user-purchases")
        const data = await res.json()
        setPurchasedPrograms(data.purchasedExamIds || [])
      } catch (err) {
        console.error("Failed to fetch purchases", err)
      }
    }
    fetchPurchases()
  }, [])

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/exam-packages/summary", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setCountsMap(data || {})
      } catch {
        // no-op
      }
    }
    fetchCounts()
  }, [])

  const handlePurchase = async (program: typeof examPrograms[0]) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: program.stripePriceId, type: "payment" }),
      })
      if (res.status === 401) {
        window.location.href = "/auth/login"
        return
      }
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error("Checkout error:", err)
    }
  }

  return (
    <div className="space-y-8 pt-12 lg:pt-0 animate-fade-in-up">
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

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-warning" />
          Available Exam Prep Packages
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {examPrograms.map((program, index) => {
            const counts = countsMap[program.id]
            const phases = program.phases.map((p) => {
              if (!counts) return p
              if (p.name.includes("Flashcards")) return { ...p, items: counts.flashcards }
              if (p.name.includes("Questions")) return { ...p, items: counts.questions }
              if (p.name.includes("Simulations")) return { ...p, items: counts.simulations }
              if (p.name.includes("Exams")) return { ...p, items: counts.practiceExams }
              return p
            })
            const isPurchased = purchasedPrograms.includes(program.id)

            const totalItems = phases.reduce((acc, phase) => acc + phase.items, 0)
            const completedItems = phases.reduce((acc, phase) => acc + phase.completed, 0)
            const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

            const Icon = program.icon

            return (
              <div key={program.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <GlassCard className="relative overflow-hidden transition-all duration-300 hover:border-primary/30 card-hover">
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-bold z-10">
                    ${program.price}
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", program.color)}>
                        <Icon className={cn("w-7 h-7", program.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-lg">{program.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", difficultyColors[program.difficulty as keyof typeof difficultyColors])}>
                        {program.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {program.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        Lifetime Access
                      </span>
                      {isPurchased && (
                        <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-medium">
                          Unlocked
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {phases.map((phase, idx) => {
                        const icons = [BookOpen, HelpCircle, Stethoscope, FileText]
                        const PhaseIcon = icons[idx]
                        return (
                          <div key={phase.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <PhaseIcon className="w-3.5 h-3.5" />
                            <span>{phase.items} {phase.name.split(" ").pop()}</span>
                          </div>
                        )
                      })}
                    </div>

                    {isPurchased && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground font-medium">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                      </div>
                    )}

                    <div className="mt-auto">
                      <Button
                        onClick={() => {
                          if (!isPurchased) handlePurchase(program)
                        }}
                        className={cn(
                          "w-full h-11 btn-hover-lift",
                          isPurchased
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                        )}
                        disabled={isPurchased}
                      >
                        {isPurchased ? (
                          <>Purchased <CheckCircle className="w-4 h-4 ml-1" /></>
                        ) : (
                          <>Purchase for ${program.price} <ChevronRight className="w-4 h-4 ml-1" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
