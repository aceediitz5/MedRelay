"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import {
  Ambulance,
  Hospital,
  Microscope,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Stethoscope,
  CheckCircle,
  ChevronRight,
  Package,
  Star,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

const examPackages = [
  {
    id: "nremt",
    name: "NREMT Certification Prep",
    description: "Everything you need to pass the NREMT Basic EMT exam",
    icon: Ambulance,
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-400",
    price: 99,
    stripePriceId: "price_1TAcZiHTnaP0wMR8i8gXGLS1",
    features: [
      "150+ Flashcards",
      "200 Practice Questions",
      "15 Case Simulations",
      "3 Full Practice Exams",
    ],
    stats: { flashcards: 150, questions: 200, cases: 15 },
  },
  {
    id: "paramedic",
    name: "Paramedic Certification Prep",
    description: "Advanced preparation for Paramedic certification",
    icon: Ambulance,
    color: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    price: 129,
    stripePriceId: "price_1TAcb1HTnaP0wMR8B1kztL3M",
    features: [
      "200+ Flashcards",
      "280 Practice Questions",
      "20 Case Simulations",
      "4 Full Practice Exams",
    ],
    stats: { flashcards: 200, questions: 280, cases: 20 },
  },
  {
    id: "nclex",
    name: "NCLEX Nursing Prep",
    description: "Comprehensive NCLEX-RN exam preparation",
    icon: Hospital,
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    iconColor: "text-pink-400",
    price: 149,
    stripePriceId: "price_1TAcbMHTnaP0wMR8llyNupdV",
    features: [
      "250+ Flashcards",
      "350 Practice Questions",
      "18 Case Simulations",
      "5 Full Practice Exams",
    ],
    stats: { flashcards: 250, questions: 350, cases: 18 },
  },
  {
    id: "mcat",
    name: "MCAT Foundations",
    description: "Build a strong foundation for medical school entrance",
    icon: Microscope,
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
    iconColor: "text-cyan-400",
    price: 199,
    stripePriceId: "price_1TAcbjHTnaP0wMR8vB1uQ9ZQ",
    features: [
      "300+ Flashcards",
      "400 Practice Questions",
      "12 Case Simulations",
      "6 Full Practice Exams",
    ],
    stats: { flashcards: 300, questions: 400, cases: 12 },
  },
  {
    id: "usmle",
    name: "USMLE Step 1 Prep",
    description: "Comprehensive prep for USMLE Step 1",
    icon: GraduationCap,
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    price: 249,
    stripePriceId: "price_1TAccWHTnaP0wMR8CiF5Z3Tk",
    features: [
      "350+ Flashcards",
      "500 Practice Questions",
      "25 Case Simulations",
      "8 Full Practice Exams",
    ],
    stats: { flashcards: 350, questions: 500, cases: 25 },
  },
]

function ExamPackageCard({
  pkg,
  isPurchased,
  onPurchase,
}: {
  pkg: typeof examPackages[0]
  isPurchased: boolean
  onPurchase: (pkg: typeof examPackages[0]) => void
}) {
  const Icon = pkg.icon

  return (
    <GlassCard className={cn("relative flex flex-col h-full transition-all duration-300 hover:scale-[1.02]")}>
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-bold">
        ${pkg.price}
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", pkg.color)}>
          <Icon className={cn("w-7 h-7", pkg.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg">{pkg.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
        </div>
      </div>

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

      <div className="flex-1 space-y-2 mb-4">
        {pkg.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-success shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-foreground">${pkg.price}</span>
          <span className="text-xs text-muted-foreground">one-time</span>
        </div>

        <Button
          onClick={() => {
            if (!isPurchased) onPurchase(pkg)
          }}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPurchased}
        >
          {isPurchased ? (
            <>Purchased <CheckCircle className="w-4 h-4 ml-1" /></>
          ) : (
            <>Purchase <ChevronRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </GlassCard>
  )
}

export default function ExamPackagesPage() {
  const [purchasedPackages, setPurchasedPackages] = useState<string[]>([])

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const res = await fetch("/api/user-purchases")
        const data = await res.json()
        setPurchasedPackages(data.purchasedExamIds || [])
      } catch (err) {
        console.error("Failed to fetch purchases", err)
      }
    }

    fetchPurchases()
  }, [])

  const handlePurchase = async (pkg: typeof examPackages[0]) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: pkg.stripePriceId, type: "payment" }),
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
    <div className="space-y-8 pt-12 lg:pt-0">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Exam Packages</h1>
        </div>
        <p className="text-muted-foreground">
          Choose a comprehensive study package tailored to your certification exam
        </p>
      </div>

      <GlassCard className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">One-Time Purchase, Lifetime Access</h3>
              <p className="text-sm text-muted-foreground">
                Each exam package is independently purchasable. No subscriptions required.
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

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {examPackages.map((pkg) => (
          <ExamPackageCard
            key={pkg.id}
            pkg={pkg}
            isPurchased={purchasedPackages.includes(pkg.id)}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

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

