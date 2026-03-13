"use client"

import { ReactNode, useState } from "react"
import { Lock, Crown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UpgradeModal } from "./upgrade-modal"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface LockedContentProps {
  children: ReactNode
  isLocked: boolean
  feature?: "flashcards" | "questions" | "simulations" | "exam_prep" | "analytics"
  message?: string
  showInline?: boolean
  className?: string
}

export function LockedContent({
  children,
  isLocked,
  feature = "flashcards",
  message,
  showInline = false,
  className,
}: LockedContentProps) {
  const [modalOpen, setModalOpen] = useState(false)

  if (!isLocked) {
    return <>{children}</>
  }

  const defaultMessages = {
    flashcards: "Unlock unlimited flashcards with MedRelay Pro",
    questions: "Unlock unlimited questions with MedRelay Pro",
    simulations: "Unlock case simulations with MedRelay Pro",
    exam_prep: "Unlock exam prep programs with MedRelay Pro",
    analytics: "Unlock advanced analytics with MedRelay Pro",
  }

  const displayMessage = message || defaultMessages[feature]

  if (showInline) {
    return (
      <>
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-border bg-card/50",
            className
          )}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-warning" />
            </div>
            <p className="text-foreground font-medium mb-4">{displayMessage}</p>
            <Button onClick={() => setModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
          <div className="opacity-30 pointer-events-none">{children}</div>
        </div>
        <UpgradeModal open={modalOpen} onOpenChange={setModalOpen} feature={feature} />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "relative block w-full text-left cursor-pointer group",
          className
        )}
      >
        <div className="relative">
          <div className="opacity-50 group-hover:opacity-60 transition-opacity pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/20 border border-warning/30 text-warning text-sm font-medium">
              <Lock className="w-4 h-4" />
              <span>Pro</span>
            </div>
          </div>
        </div>
      </button>
      <UpgradeModal open={modalOpen} onOpenChange={setModalOpen} feature={feature} />
    </>
  )
}

// Upgrade Banner Component for dashboards
export function UpgradeBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Upgrade to MedRelay Pro</h3>
            <p className="text-sm text-muted-foreground">
              Unlimited access to all study materials, simulations, and exam prep
            </p>
          </div>
        </div>
        <Link href="/dashboard/pricing">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </Link>
      </div>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
    </div>
  )
}

// Usage Indicator for showing daily limits
interface UsageIndicatorProps {
  used: number
  limit: number
  label: string
  isPro?: boolean
}

export function UsageIndicator({ used, limit, label, isPro }: UsageIndicatorProps) {
  const percentage = isPro ? 0 : Math.min((used / limit) * 100, 100)
  const isAtLimit = !isPro && used >= limit

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          "font-medium",
          isAtLimit ? "text-destructive" : "text-foreground"
        )}>
          {isPro ? "Unlimited" : `${used}/${limit}`}
        </span>
      </div>
      {!isPro && (
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isAtLimit ? "bg-destructive" : percentage > 80 ? "bg-warning" : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
