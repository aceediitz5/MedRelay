"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Crown, Zap, BookOpen, HelpCircle, Stethoscope, TrendingUp, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: "flashcards" | "questions" | "simulations" | "exam_prep" | "analytics"
  limitReached?: boolean
}

const featureMessages = {
  flashcards: {
    title: "Flashcard Limit Reached",
    description: "You've reviewed 20 flashcards today. Upgrade to MedRelay Pro for unlimited daily reviews.",
    icon: BookOpen,
  },
  questions: {
    title: "Question Limit Reached",
    description: "You've answered 10 questions today. Upgrade to MedRelay Pro for unlimited practice.",
    icon: HelpCircle,
  },
  simulations: {
    title: "Unlock Case Simulations",
    description: "Case simulations are available exclusively to Pro members. Practice real clinical scenarios.",
    icon: Stethoscope,
  },
  exam_prep: {
    title: "Purchase Exam Prep Package",
    description: "Exam prep programs are sold separately. Choose the certification you need.",
    icon: TrendingUp,
  },
  analytics: {
    title: "Unlock Advanced Analytics",
    description: "Track your progress with detailed analytics and performance insights.",
    icon: TrendingUp,
  },
}

const proFeatures = [
  "Unlimited flashcard reviews",
  "Unlimited practice questions",
  "Full case simulation access",
  "Advanced analytics & tracking",
  "XP achievements system",
  "Full topic library access",
  "Daily study engine",
]

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_PRO_PRICE_ID || "price_1TAcXRHTnaP0wMR8HKQROxnf"

export function UpgradeModal({ open, onOpenChange, feature = "flashcards" }: UpgradeModalProps) {
  const message = featureMessages[feature]
  const Icon = message.icon
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: PRO_PRICE_ID, type: "subscription" }),
      })
      if (res.status === 401) {
        window.location.href = "/auth/login"
        return
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
              <Icon className="w-8 h-8 text-warning" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">{message.title}</DialogTitle>
          <DialogDescription className="text-center">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Pro Plan Highlight */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-warning" />
                <span className="font-semibold text-foreground">MedRelay Pro</span>
              </div>
              <span className="text-lg font-bold text-foreground">$12<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
            </div>
            <ul className="space-y-2">
              {proFeatures.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            {feature === "exam_prep" ? (
              <Link href="/dashboard/exam-packages" onClick={() => onOpenChange(false)}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  View exam packages
                </Button>
              </Link>
            ) : (
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-sm"
                onClick={handleUpgrade}
                disabled={loading}
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? "Redirecting..." : "Upgrade to Pro"}
              </Button>
            )}
            <Link href="/dashboard/pricing" onClick={() => onOpenChange(false)}>
              <Button variant="ghost" className="w-full">
                View pricing
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime. No questions asked.
        </p>
      </DialogContent>
    </Dialog>
  )
}
