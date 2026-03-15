"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function AssignmentForm({ classId, onCreated }: { classId: string; onCreated: () => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    if (!title) return
    setLoading(true)
    const res = await fetch(`/api/instructor/classes/${classId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, due_date: dueDate || null }),
    })
    setLoading(false)
    if (res.ok) {
      setTitle("")
      setDescription("")
      setDueDate("")
      onCreated()
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Assignment title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Optional description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <Button onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Assignment"}
      </Button>
    </div>
  )
}
