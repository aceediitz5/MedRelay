"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react"

function generateClassCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function CreateClassPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create a class")
      setLoading(false)
      return
    }

    const classCode = generateClassCode()

    const { error: insertError } = await supabase
      .from("instructor_classes")
      .insert({
        instructor_id: user.id,
        name,
        description: description || null,
        class_code: classCode,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard/instructor")
    router.refresh()
  }

  return (
    <div className="space-y-8 pt-12 lg:pt-0 max-w-xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/instructor" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Create a Class</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new class for your students
        </p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Class Details</h2>
            <p className="text-sm text-muted-foreground">Students will use a code to join</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Class Name *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Paramedic Program Fall 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              placeholder="Brief description of the class..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Class
            </Button>
            <Link href="/dashboard/instructor">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
