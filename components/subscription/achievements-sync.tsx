"use client"

import { useEffect } from "react"

export function AchievementsSync() {
  useEffect(() => {
    fetch("/api/achievements/refresh", { method: "POST" })
  }, [])

  return null
}
