"use client"

import { useState } from "react"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown } from "lucide-react"

type BillingCycle = "monthly" | "yearly"

const plans = [
  {
    name: "Free",
    description: "Get started with the essentials",
    monthly: 0,
    yearly: 0,
    features: [
      "Limited sample content",
      "Intro flashcards",
      "Preview quizzes",
      "One learning track preview",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Basic",
    description: "Great for focused learners on one track",
    monthly: 12,
    yearly: 120,
    features: [
      "Access to 1 learning track",
      "Study guides",
      "Basic quizzes",
      "Flashcards",
      "Limited progress tracking",
    ],
    cta: "Choose Basic",
    highlight: false,
  },
  {
    name: "Pro",
    description: "Everything you need to pass faster",
    monthly: 19,
    yearly: 190,
    features: [
      "Access to all learning tracks",
      "Full question bank",
      "Practice exams",
      "Progress tracking",
      "Adaptive study tools",
    ],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Premium",
    description: "Advanced tools for serious exam prep",
    monthly: 29,
    yearly: 290,
    features: [
      "Everything in Pro",
      "Advanced clinical case studies",
      "Exam simulations",
      "Personalized study schedules",
      "Advanced analytics",
    ],
    cta: "Choose Premium",
    highlight: false,
  },
]

export function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>("monthly")

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />
      <div className="max-w-6xl mx-auto relative">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Start free. Upgrade when you’re ready for full access and faster results.
            </p>
          </div>
        </ScrollReveal>

        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 text-sm rounded-full transition ${
                billing === "monthly"
                  ? "bg-white text-black"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`px-4 py-1.5 text-sm rounded-full transition ${
                billing === "yearly"
                  ? "bg-white text-black"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Yearly
            </button>
          </div>
          <span className="ml-3 text-xs text-cyan-300">Save 17% yearly</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const price = billing === "monthly" ? plan.monthly : plan.yearly
            const periodLabel = billing === "monthly" ? "month" : "year"
            const billedLabel = billing === "yearly" ? "Billed annually" : null

            return (
              <ScrollReveal key={plan.name} animation="fade-up" delay={120 * index}>
                <div
                  className={`relative rounded-3xl p-7 h-full flex flex-col ${
                    plan.highlight
                      ? "bg-gradient-to-b from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/30"
                      : "bg-white/[0.02] border border-white/5"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium shadow-lg shadow-cyan-500/25">
                        <Crown className="w-4 h-4" /> Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-white">${price}</span>
                      <span className="text-gray-400">/ {periodLabel}</span>
                    </div>
                    {billedLabel && (
                      <div className="text-xs text-gray-500 mt-1">{billedLabel}</div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Link href="/auth/sign-up" className="block">
                      <Button
                        className={`w-full h-11 text-sm ${
                          plan.highlight
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/20"
                            : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
