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
  CheckCircle,
  ChevronRight,
  Package,
  Zap,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Exam packages
const examPackages = [
  {
    id: "nremt-basic",
    name: "NREMT-B Complete Package",
    description: "Everything you need to pass the NREMT Basic EMT exam",
    icon: Ambulance,
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-400",
    price: "Free",
    isPremium: false,
    features: [
      "100+ Flashcards",
      "80 Practice Questions",
      "5 Case Simulations",
      "Basic Study Guide",
    ],
    stats: { flashcards: 100, questions: 80, cases: 5 },
  },
  {
    id: "nremt-advanced",
    name: "NREMT-P Pro Package",
    description: "Advanced preparation for Paramedic certification",
    icon: Ambulance,
    color: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    price: "$29/mo",
    isPremium: true,
    features: [
      "200+ Flashcards",
      "280 Practice Questions",
      "20 Case Simulations",
      "4 Full Practice Exams",
      "Personalized Study Plan",
      "Priority Support",
    ],
    stats: { flashcards: 200, questions: 280, cases: 20 },
  },
  {
    id: "nclex-rn",
    name: "NCLEX-RN Pro Package",
    description: "Comprehensive NCLEX-RN exam preparation",
    icon: Hospital,
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    iconColor: "text-pink-400",
    price: "$29/mo",
    isPremium: true,
    features: [
      "250+ Flashcards",
      "350 Practice Questions",
      "18 Case Simulations",
      "5 Full Practice Exams",
      "NCLEX-Style Questions",
      "Test-Taking Strategies",
    ],
    stats: { flashcards: 250, questions: 350, cases: 18 },
  },
  {
    id: "mcat-foundations",
    name: "MCAT Foundations Package",
    description: "Build a strong foundation for medical school entrance",
    icon: Microscope,
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
    iconColor: "text-cyan-400",
    price: "$39/mo",
    isPremium: true,
    features: [
      "300+ Flashcards",
      "400 Practice Questions",
      "12 Case Simulations",
      "6 Full Practice Exams",
      "Science Passage Practice",
      "CARS Strategies",
    ],
    stats: { flashcards: 300, questions: 400, cases: 12 },
  },
  {
    id: "usmle-step1",
    name: "USMLE Step 1 Package",
    description: "Comprehensive prep for USMLE Step 1",
    icon: GraduationCap,
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    price: "$49/mo",
    isPremium: true,
    features: [
      "350+ Flashcards",
      "500 Practice Questions",
      "25 Case Simulations",
      "8 Full Practice Exams",
      "First Aid Integration",
      "Spaced Repetition System",
    ],
    stats: { flashcards: 350, questions: 500, cases: 25 },
  },
]

function ExamPackageCard({ pkg, isPro }: { pkg: typeof examPackages[0]; isPro: boolean }) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const Icon = pkg.icon
  const isLocked = pkg.isPremium && !isPro

  return (
    <>
      <GlassCard className={cn(
        "relative flex flex-col h-full transition-all duration-300 hover:scale-[1.02]",
        isLocked && "opacity-90"
      )}>
        {/* Premium badge */}
        {pkg.isPremium && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/20 border border-warning/30 text-warning text-xs font-medium">
            <Crown className="w-3 h-3" />
            <span>Pro</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br",
            pkg.color
          )}>
            <Icon className={cn("w-7 h-7", pkg.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg">{pkg.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-secondary/30">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-foreground font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              {pkg.stats.flashcards}+
            </div>
            <p className="text-xs text-muted-foreground">Cards</p>
          </div>
          <div className="text-center border-x border-border">
            <div className="flex items-center justify-center gap-1 text-foreground font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              {pkg.stats.questions}
            </div>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-foreground font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-primary" />
              {pkg.stats.cases}
            </div>
            <p className="text-xs text-muted-foreground">Cases</p>
          </div>
        </div>

        {/* Features */}
        <div className="flex-1 space-y-2 mb-4">
          {pkg.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-foreground">{pkg.price}</span>
            {pkg.isPremium && <span className="text-xs text-muted-foreground">billed monthly</span>}
          </div>
          
          {isLocked ? (
            <Button
              onClick={() => setUpgradeModalOpen(true)}
              className="w-full bg-secondary text-foreground hover:bg-secondary/80"
            >
              <Lock className="w-4 h-4 mr-2" />
              Unlock Package
            </Button>
          ) : (
            <Link href={`/dashboard/flashcards`}>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Start Learning <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </GlassCard>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature="exam_packages"
      />
    </>
  )
}

export default function ExamPackagesPage() {
  const { isPro, isLoading } = useSubscription()

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Exam Packages</h1>
        </div>
        <p className="text-muted-foreground">
          Choose a comprehensive study package tailored to your certification exam
        </p>
      </div>

      {/* Pro Banner */}
      {!isPro && !isLoading && (
        <GlassCard className="relative overflow-hidden bg-gradient-to-r from-warning/10 via-primary/10 to-warning/10 border-warning/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Unlock All Premium Packages</h3>
                <p className="text-sm text-muted-foreground">
                  Get unlimited access to all exam packages with a Pro subscription
                </p>
              </div>
            </div>
            <Link href="/dashboard/pricing">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                <Zap className="w-4 h-4 mr-2" />
                View Pricing
              </Button>
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {examPackages.map((pkg) => (
          <ExamPackageCard key={pkg.id} pkg={pkg} isPro={isPro} />
        ))}
      </div>

      {/* Info Section */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">What's included in each package?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, title: "Flashcards", desc: "Master key concepts with spaced repetition" },
            { icon: HelpCircle, title: "Questions", desc: "Practice with exam-style questions" },
            { icon: Stethoscope, title: "Case Studies", desc: "Apply knowledge to real scenarios" },
            { icon: Clock, title: "Practice Exams", desc: "Simulate the real test experience" },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-lg bg-secondary/30">
              <item.icon className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
