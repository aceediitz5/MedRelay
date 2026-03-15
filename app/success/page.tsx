"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <GlassCard className="max-w-xl w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment successful</h1>
        <p className="text-muted-foreground mb-6">
          Thanks for your purchase. Your access is being updated now.
        </p>

        <Link href="/dashboard">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Go to dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </GlassCard>
    </div>
  )
}
