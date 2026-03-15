"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Zap } from "lucide-react"

export function LimitBanner({
  limitReached,
  message = "Daily limit reached. Upgrade to continue.",
}: {
  limitReached: boolean
  message?: string
}) {
  if (!limitReached) return null

  return (
    <GlassCard className="border-warning/30 bg-warning/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Pro removes daily limits and unlocks all premium features.
          </p>
        </div>
        <Link href="/dashboard/pricing">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    </GlassCard>
  )
}
