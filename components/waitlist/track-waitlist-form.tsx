"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TrackWaitlistForm({ track }: { track: string }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, track }),
      })

      if (!res.ok) {
        setMessage("Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      setMessage("You’re on the list. We’ll notify you at launch.")
      setEmail("")
    } catch {
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
      />
      <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
        {loading ? "Saving..." : "Notify Me When It Launches"}
      </Button>
      {message && (
        <p className="text-xs text-muted-foreground mt-2 sm:mt-0 sm:ml-2">
          {message}
        </p>
      )}
    </form>
  )
}
