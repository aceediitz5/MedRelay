"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TrackWaitlistForm({ track }: { track: string }) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, track }),
      })
      if (res.ok) {
        setMessage("You’re on the waitlist!")
        setEmail("")
      } else {
        setMessage("Something went wrong. Try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-3">
      <Input
        type="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Notify Me"}
      </Button>
      {message && <p className="text-xs text-muted-foreground mt-2">{message}</p>}
    </form>
  )
}
