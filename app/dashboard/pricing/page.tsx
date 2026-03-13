"use client"

import { Fragment } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/lib/subscription/context"
import {
  CheckCircle,
  XCircle,
  Crown,
  Zap,
  Star,
  BookOpen,
  HelpCircle,
  Stethoscope,
  Shield,
  Clock,
  Ambulance,
  Hospital,
  Microscope,
  GraduationCap,
  FileText,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Individual exam prep packages - independently purchasable
const examPackages = [
  {
    id: "nremt",
    name: "NREMT Certification Prep",
    price: 99,
    duration: "8-12 weeks",
    icon: Ambulance,
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-400",
    flashcards: 450,
    questions: 600,
    simulations: 45,
    practiceExams: 5,
    features: ["450+ flashcards", "600+ practice questions", "45 case simulations", "5 full practice exams", "8-12 week study plan", "Lifetime access"],
  },
  {
    id: "paramedic",
    name: "Paramedic Certification Prep",
    price: 129,
    duration: "12-16 weeks",
    icon: Ambulance,
    color: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    flashcards: 650,
    questions: 850,
    simulations: 60,
    practiceExams: 6,
    features: ["650+ flashcards", "850+ practice questions", "60 case simulations", "6 full practice exams", "12-16 week study plan", "Lifetime access"],
  },
  {
    id: "nclex",
    name: "NCLEX Nursing Prep",
    price: 149,
    duration: "10-14 weeks",
    icon: Hospital,
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    iconColor: "text-pink-400",
    flashcards: 800,
    questions: 1000,
    simulations: 50,
    practiceExams: 8,
    features: ["800+ flashcards", "1,000+ practice questions", "50 case simulations", "8 full practice exams", "10-14 week study plan", "Lifetime access"],
  },
  {
    id: "mcat",
    name: "MCAT Foundations",
    price: 199,
    duration: "16-20 weeks",
    icon: Microscope,
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
    iconColor: "text-cyan-400",
    flashcards: 950,
    questions: 1200,
    simulations: 40,
    practiceExams: 10,
    features: ["950+ flashcards", "1,200+ practice questions", "40 case simulations", "10 full practice exams", "16-20 week study plan", "Lifetime access"],
  },
  {
    id: "usmle",
    name: "USMLE Step 1 Prep",
    price: 249,
    duration: "20-24 weeks",
    icon: GraduationCap,
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    flashcards: 1100,
    questions: 1500,
    simulations: 80,
    practiceExams: 12,
    features: ["1,100+ flashcards", "1,500+ practice questions", "80 case simulations", "12 full practice exams", "20-24 week study plan", "Lifetime access"],
  },
]

// Comparison features for the table
const comparisonFeatures = [
  {
    category: "Daily Study",
    features: [
      { name: "Flashcards per day", free: "20", pro: "Unlimited" },
      { name: "Practice questions per day", free: "10", pro: "Unlimited" },
      { name: "Case simulations", free: "Preview only", pro: "Full access" },
    ],
  },
  {
    category: "Content Access",
    features: [
      { name: "Full question bank (1,000+)", free: false, pro: true },
      { name: "Full flashcard library (2,000+)", free: false, pro: true },
      { name: "All 20+ medical topics", free: false, pro: true },
      { name: "Exam prep programs", free: "Sold separately", pro: "Sold separately" },
    ],
  },
  {
    category: "Features",
    features: [
      { name: "Advanced analytics", free: false, pro: true },
      { name: "XP & achievements", free: false, pro: true },
      { name: "Daily study engine", free: false, pro: true },
      { name: "Progress tracking", free: "Basic", pro: "Advanced" },
      { name: "Spaced repetition algorithm", free: false, pro: true },
    ],
  },
]

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with essential study tools",
    icon: BookOpen,
    features: [
      "20 flashcards per day",
      "10 practice questions per day",
      "Case simulation previews",
      "Basic progress tracking",
      "Access to select topics",
    ],
    cta: "Current Plan",
    current: true,
    popular: false,
  },
  {
    name: "MedRelay Pro",
    price: "$12",
    period: "/month",
    description: "Everything you need to pass your exams",
    icon: Crown,
    features: [
      "Unlimited flashcard reviews",
      "Unlimited practice questions",
      "Full case simulation access",
      "Advanced analytics & tracking",
      "XP & achievements system",
      "All 20+ medical topics",
      "Daily study engine",
      "Spaced repetition algorithm",
    ],
    cta: "Upgrade to Pro",
    current: false,
    popular: true,
  },
]

export default function PricingPage() {
  const { isPro, isLoading } = useSubscription()

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/20 text-warning text-sm font-medium mb-4">
          <Crown className="w-4 h-4" />
          Upgrade Your Learning
        </div>
        <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Unlock your full potential with premium features designed to accelerate your medical education
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = isPro ? plan.name === "MedRelay Pro" : plan.name === "Free"
          const Icon = plan.icon

          return (
            <GlassCard
              key={plan.name}
              className={cn(
                "flex flex-col relative",
                plan.popular && "ring-2 ring-primary"
              )}
              glow={plan.popular}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    plan.popular ? "bg-warning/20" : "bg-secondary"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      plan.popular ? "text-warning" : "text-muted-foreground"
                    )} />
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
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Cancel anytime. No questions asked.
                </p>
              )}
            </GlassCard>
          )
        })}
      </div>

      {/* Exam Prep Packages Section */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Exam Prep Packages</h2>
          <p className="text-muted-foreground">
            One-time purchase. Lifetime access. No subscription required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {examPackages.map((pkg, index) => {
            const Icon = pkg.icon
            return (
              <GlassCard
                key={pkg.id}
                className={cn(
                  "flex flex-col relative transition-all duration-300 hover:scale-[1.02] card-hover",
                  `border ${pkg.borderColor}`
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon and Name */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                  pkg.color
                )}>
                  <Icon className={cn("w-6 h-6", pkg.iconColor)} />
                </div>

                <h3 className="font-semibold text-foreground text-sm mb-1">{pkg.name}</h3>
                
                {/* Price */}
                <div className="mb-3">
                  <span className="text-3xl font-bold text-foreground">${pkg.price}</span>
                  <span className="text-xs text-muted-foreground ml-1">one-time</span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  {pkg.duration}
                </div>

                {/* Content Stats */}
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">{pkg.flashcards}+ flashcards</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">{pkg.questions}+ questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Stethoscope className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">{pkg.simulations} simulations</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">{pkg.practiceExams} practice exams</span>
                  </div>
                </div>

                {/* CTA */}
                <Button 
                  className="w-full btn-hover-lift bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                  size="sm"
                >
                  Purchase <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </GlassCard>
            )
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <GlassCard className="max-w-4xl mx-auto overflow-hidden">
        <h2 className="text-xl font-semibold text-foreground mb-6">Subscription Feature Comparison</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Feature</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground w-32">Free</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-foreground w-32 bg-primary/10 rounded-t-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Crown className="w-4 h-4 text-warning" />
                    Pro
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((category, categoryIndex) => (
                <Fragment key={category.category}>
                  <tr>
                    <td
                      colSpan={3}
                      className={cn(
                        "py-3 px-4 text-sm font-semibold text-foreground bg-secondary/50",
                        categoryIndex > 0 && "border-t border-border"
                      )}
                    >
                      {category.category}
                    </td>
                  </tr>
                  {category.features.map((feature, index) => (
                    <tr key={feature.name} className={cn(index < category.features.length - 1 && "border-b border-border/50")}>
                      <td className="py-3 px-4 text-sm text-foreground">{feature.name}</td>
                      <td className="text-center py-3 px-4">
                        {typeof feature.free === "boolean" ? (
                          feature.free ? (
                            <CheckCircle className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{feature.free}</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 bg-primary/5">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <CheckCircle className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-foreground font-medium">{feature.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Trust Signals */}
      <div className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Secure Payment", description: "256-bit SSL encryption via Stripe" },
            { icon: Clock, title: "Cancel Anytime", description: "No long-term commitments" },
            { icon: Zap, title: "Instant Access", description: "Start learning immediately" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30">
              <item.icon className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <GlassCard className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-foreground mb-1">Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through Stripe.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">How do daily limits work?</h3>
            <p className="text-sm text-muted-foreground">
              Free users get 20 flashcard reviews and 10 practice questions per day. Limits reset at midnight. Pro users have unlimited access.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
