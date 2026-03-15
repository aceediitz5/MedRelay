"use client"

import { useSearchParams } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const bundleExamPriceId = searchParams.get("bundle_exam_price_id")
  const bundleExamPackageId = searchParams.get("bundle_exam_package_id")

  const handleBundleCheckout = async () => {
    if (!bundleExamPriceId) return
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: bundleExamPriceId, type: "payment" }),
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <GlassCard className="max-w-xl w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment successful</h1>
        <p className="text-muted-foreground mb-6">
          Thanks for your purchase. Your access is being updated now.
        </p>

        {bundleExamPriceId ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Next step: complete your exam package purchase
              {bundleExamPackageId ? ` (${bundleExamPackageId.toUpperCase()})` : ""}.
            </p>
            <Button
              onClick={handleBundleCheckout}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Redirecting..." : "Continue to exam checkout"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <Link href="/dashboard">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Go to dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </GlassCard>
    </div>
  )
}
