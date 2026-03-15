"use client"

import { useEffect, useMemo, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/lib/subscription/context"
import {
  CheckCircle,
  Crown,
  Zap,
  Star,
  BookOpen,
  HelpCircle,
  Stethoscope,
  Clock,
  Ambulance,
  Hospital,
  Microscope,
  GraduationCap,
  FileText,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const examPackages = [
  {
    id: "nremt",
    name: "NREMT Certification Prep",
    price: 99,
    stripePriceId: "price_1TAcZiHTnaP0wMR8i8gXGLS1",
    icon: Ambulance,
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-400",
    duration: "8-12 weeks",
    flashcards: 150,
    questions: 200,
    simulations: 15,
    practiceExams: 3,
  },
  {
    id: "paramedic",
    name: "Paramedic Certification Prep",
    price: 129,
    stripePriceId: "price_1TAcb1HTnaP0wMR8B1kztL3M",
    icon: Ambulance,
    color: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    duration: "12-16 weeks",
    flashcards: 200,
    questions: 280,
    simulations: 20,
    practiceExams: 4,
  },
  {
    id: "nclex",
    name: "NCLEX Nursing Prep",
    price: 149,
    stripePriceId: "price_1TAcbMHTnaP0wMR8llyNupdV",
    icon: Hospital,
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    iconColor: "text-pink-400",
    duration: "10-14 weeks",
    flashcards: 250,
    questions: 350,
    simulations: 18,
    practiceExams: 5,
  },
  {
    id: "mcat",
    name: "MCAT Foundations",
    price: 199,
    stripePriceId: "price_1TAcbjHTnaP0wMR8vB1uQ9ZQ",
    icon: Microscope,
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
    iconColor: "text-cyan-400",
    duration: "16-20 weeks",
    flashcards: 300,
    questions: 400,
    simulations: 12,
    practiceExams: 6,
  },
  {
    id: "usmle",
    name: "USMLE Step 1 Prep",
    price: 249,
    stripePriceId: "price_1TAccWHTnaP0wMR8CiF5Z3Tk",
    icon: GraduationCap,
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    duration: "20-24 weeks",
    flashcards: 350,
    questions: 500,
    simulations: 25,
    practiceExams: 8,
  },
]

type SummaryCounts = {
  flashcards: number
  questions: number
  simulations: number
  practiceExams: number
}

export default function PricingPage() {
  const { isPro } = useSubscription()
  const [purchasedExams, setPurchasedExams] = useState<string[]>([])
  const [countsMap, setCountsMap] = useState<Record<string, SummaryCounts>>({})
  const [totalCounts, setTotalCounts] = useState<SummaryCounts>({
    flashcards: 0,
    questions: 0,
    simulations: 0,
    practiceExams: 0,
  })

  const bundles = [
    {
      id: "bundle-nremt",
      name: "Pro + NREMT",
      price: 129,
      stripePriceId: "price_1TB6VXHTnaP0wMR8NXSJAdD6",
      examId: "nremt",
    },
    {
      id: "bundle-paramedic",
      name: "Pro + Paramedic",
      price: 159,
      stripePriceId: "price_1TB6VyHTnaP0wMR8Knx7V5Cd",
      examId: "paramedic",
    },
    {
      id: "bundle-nclex",
      name: "Pro + NCLEX",
      price: 179,
      stripePriceId: "price_1TB6WOHTnaP0wMR8pJh0lBwN",
      examId: "nclex",
    },
    {
      id: "bundle-mcat",
      name: "Pro + MCAT",
      price: 229,
      stripePriceId: "price_1TB6WfHTnaP0wMR8JUH0Aphr",
      examId: "mcat",
    },
    {
      id: "bundle-usmle",
      name: "Pro + USMLE Step 1",
      price: 279,
      stripePriceId: "price_1TB6X2HTnaP0wMR8jq3a89V6",
      examId: "usmle",
      bestValue: true,
    },
  ]

  useEffect(() => {
    let active = true

    const loadPurchases = async () => {
      try {
        const res = await fetch("/api/user-purchases", { cache: "no-store" })
        const data = await res.json()
        if (active) setPurchasedExams(data.purchasedExamIds || [])
      } catch (err) {
        console.error("Failed to fetch user purchases", err)
      }
    }

    loadPurchases()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadCounts = async () => {
      try {
        const res = await fetch("/api/exam-packages/summary", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (active) setCountsMap(data || {})
      } catch {
        // no-op
      }
    }

    const loadTotals = async () => {
      try {
        const res = await fetch("/api/content/summary", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (active) {
          setTotalCounts({
            flashcards: data.flashcards || 0,
            questions: data.questions || 0,
            simulations: data.simulations || 0,
            practiceExams: data.practiceExams || 0,
          })
        }
      } catch {
        // no-op
      }
    }

    loadCounts()
    loadTotals()

    const id = setInterval(() => {
      loadCounts()
      loadTotals()
    }, 30000)

    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  const plans = useMemo(
    () => [
      {
        name: "Free",
        price: "$0",
        period: "forever",
        icon: BookOpen,
        description: "Get started with the basics",
        features: [
          "Limited daily flashcards and questions",
          "Preview case simulations",
          "Basic progress tracking",
          "Access to select topics",
        ],
        cta: "Current Plan",
        popular: false,
      },
      {
        name: "MedRelay Pro",
        price: "$12",
        period: "/month",
        icon: Crown,
        description: "Everything you need to pass your exams",
        features: [
          totalCounts.flashcards ? `${totalCounts.flashcards}+ flashcards unlocked` : "Unlimited flashcard reviews",
          totalCounts.questions ? `${totalCounts.questions}+ practice questions` : "Unlimited practice questions",
          totalCounts.simulations ? `${totalCounts.simulations} case simulations` : "Full case simulation access",
          totalCounts.practiceExams ? `${totalCounts.practiceExams} practice exams` : "Advanced analytics & tracking",
          "Advanced analytics & tracking",
          "XP & achievements system",
          "All 20+ medical topics",
          "Daily study engine",
          "Spaced repetition algorithm",
        ],
        cta: "Upgrade to Pro",
        popular: true,
        stripePriceId: "price_1TAcXRHTnaP0wMR8HKQROxnf",
      },
    ],
    [totalCounts]
  )

  const buyProduct = async (priceId: string, type: "subscription" | "payment") => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, type }),
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
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/20 text-warning text-sm font-medium mb-4">
          <Crown className="w-4 h-4" /> Upgrade Your Learning
        </div>
        <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Unlock your full potential with premium features designed to accelerate your medical education
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = isPro ? plan.name === "MedRelay Pro" : plan.name === "Free"
          const Icon = plan.icon

          return (
            <GlassCard
              key={plan.name}
              className={cn("flex flex-col relative", plan.popular && "ring-2 ring-primary")}
              glow={plan.popular}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", plan.popular ? "bg-warning/20" : "bg-secondary")}>
                    <Icon className={cn("w-5 h-5", plan.popular ? "text-warning" : "text-muted-foreground")} />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
                </div>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => plan.stripePriceId && buyProduct(plan.stripePriceId, "subscription")}
                className={cn(
                  "w-full",
                  isCurrent
                    ? "bg-secondary text-secondary-foreground"
                    : plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-sm"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
                disabled={isCurrent}
              >
                {plan.popular && !isCurrent && <Zap className="w-4 h-4 mr-2" />}
                {isCurrent ? "Current Plan" : plan.cta}
              </Button>

              {plan.popular && !isCurrent && (
                <p className="text-xs text-center text-muted-foreground mt-3">Cancel anytime. No questions asked.</p>
              )}
            </GlassCard>
          )
        })}
      </div>

      <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Bundles</h2>
          <p className="text-muted-foreground">
            One-time purchase. Includes 12 months of Pro + lifetime exam access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => {
            const counts = countsMap[bundle.examId]
            return (
              <GlassCard
                key={bundle.id}
                className={cn("flex flex-col relative", bundle.bestValue && "ring-2 ring-primary")}
                glow={bundle.bestValue}
              >
                {bundle.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" /> Best Value
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{bundle.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    12 months of Pro + {bundle.examId.toUpperCase()} prep.
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Pro subscription included
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Lifetime exam access
                  </li>
                  {counts && (
                    <>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        {counts.flashcards}+ flashcards
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        {counts.questions}+ questions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        {counts.simulations} simulations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        {counts.practiceExams} practice exams
                      </li>
                    </>
                  )}
                </ul>
                <div className="mt-auto">
                  <div className="text-2xl font-bold text-foreground mb-3">${bundle.price}</div>
                  <Button
                    onClick={() => buyProduct(bundle.stripePriceId, "payment")}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Get bundle
                  </Button>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Exam Prep Packages</h2>
          <p className="text-muted-foreground">One-time purchase. Lifetime access. No subscription required.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {examPackages.map((pkg, index) => {
            const counts = countsMap[pkg.id]
            const Icon = pkg.icon
            const isPurchased = purchasedExams.includes(pkg.id)
            const flashcards = counts?.flashcards ?? pkg.flashcards
            const questions = counts?.questions ?? pkg.questions
            const simulations = counts?.simulations ?? pkg.simulations
            const practiceExams = counts?.practiceExams ?? pkg.practiceExams

            return (
              <GlassCard
                key={pkg.id}
                className={cn("flex flex-col relative transition-all duration-300 hover:scale-[1.02] card-hover", `border ${pkg.borderColor}`)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br", pkg.color)}>
                  <Icon className={cn("w-6 h-6", pkg.iconColor)} />
                </div>

                <h3 className="font-semibold text-foreground text-sm mb-1">{pkg.name}</h3>

                <div className="mb-3">
                  <span className="text-3xl font-bold text-foreground">${pkg.price}</span>
                  <span className="text-xs text-muted-foreground ml-1">one-time</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  {pkg.duration}
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">{flashcards}+ flashcards</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">{questions}+ questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Stethoscope className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">{simulations} simulations</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">{practiceExams} practice exams</span>
                  </div>
                </div>

                <Button
                  onClick={() => buyProduct(pkg.stripePriceId, "payment")}
                  className="w-full btn-hover-lift bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                  size="sm"
                  disabled={isPurchased}
                >
                  {isPurchased ? "Purchased" : "Purchase"} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}

