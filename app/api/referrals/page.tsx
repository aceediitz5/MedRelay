"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Copy, Users, Gift } from "lucide-react"

export default function ReferralsPage() {
  const [code, setCode] = useState("")
  const [referrals, setReferrals] = useState(0)
  const [rewardDays, setRewardDays] = useState(0)
  const [origin, setOrigin] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    async function fetchReferral() {
      const [codeRes, summaryRes] = await Promise.all([
        fetch("/api/referrals/create"),
        fetch("/api/referrals/summary"),
      ])

      if (codeRes.ok) {
        const codeData = await codeRes.json()
        setCode(codeData.code || "")
      }

      if (summaryRes.ok) {
        const summary = await summaryRes.json()
        setReferrals(summary.referrals || 0)
        setRewardDays(summary.rewardDays || 0)
      }
    }

    fetchReferral()
  }, [])

  const shareLink = code ? `${origin}/auth/sign-up?ref=${code}` : ""

  const handleCopy = async () => {
    if (!shareLink) return
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Referrals</h1>
        <p className="text-muted-foreground mt-1">
          Give friends 7 days of Pro. You get 7 days too.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Referrals</p>
            <p className="text-2xl font-bold text-foreground">{referrals}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <Gift className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reward Days Earned</p>
            <p className="text-2xl font-bold text-foreground">{rewardDays}</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-3">Share your link</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={shareLink} readOnly />
          <Button onClick={handleCopy} className="shrink-0">
            {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Share this link with friends. Rewards apply after they sign up.
        </p>
      </GlassCard>
    </div>
  )
}
