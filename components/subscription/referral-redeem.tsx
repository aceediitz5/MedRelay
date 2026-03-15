"use client"

import { useEffect } from "react"

export function ReferralRedeem() {
  useEffect(() => {
    const code = localStorage.getItem("referral_code_pending")
    if (!code) return

    const redeem = async () => {
      try {
        await fetch("/api/referrals/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        })
      } finally {
        localStorage.removeItem("referral_code_pending")
      }
    }

    redeem()
  }, [])

  return null
}
