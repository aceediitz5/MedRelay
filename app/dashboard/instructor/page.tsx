"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, PlusCircle, GraduationCap } from "lucide-react"

interface InstructorClass {
  id: string
  name: string
  enrollment_code: string | null
  created_at: string
}

interface StudentClass {
  id: string
  class: InstructorClass
}

export default function InstructorPage() {
  const [classes, setClasses] = useState<InstructorClass[]>([])
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([])
  const [name, setName] = useState("")
  const [joinCode, setJoinCode] = useState("")

  const loadClasses = async () => {
    const res = await fetch("/api/instructor/classes")
    if (!res.ok) return
    const data = await res.json()
    setClasses(data.instructorClasses || [])
    setStudentClasses(data.studentClasses || [])
  }

  useEffect(() => {
    loadClasses()
  }, [])

  const handleCreate = async () => {
    if (!name) return
    const res = await fetch("/api/instructor/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      setName("")
      loadClasses()
    }
  }

  const handleJoin = async () => {
    if (!joinCode) return
    const res = await fetch("/api/instructor/classes/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode }),
    })
    if (res.ok) {
      setJoinCode("")
      loadClasses()
    }
  }

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Instructor Mode</h1>
        <p className="text-muted-foreground mt-1">
          Create classes, manage cohorts, and assign study goals.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Create a Class</h2>
              <p className="text-sm text-muted-foreground">Generate an enrollment code for students.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Class name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Join a Class</h2>
              <p className="text-sm text-muted-foreground">Enter an enrollment code.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Enrollment code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <Button onClick={handleJoin} variant="outline">Join</Button>
          </div>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Your Classes</h2>
          </div>
          <div className="space-y-3">
            {classes.length === 0 && (
              <p className="text-sm text-muted-foreground">No classes created yet.</p>
            )}
            {classes.map((klass) => (
              <div key={klass.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">{klass.name}</p>
                  <p className="text-xs text-muted-foreground">Code: {klass.enrollment_code || "—"}</p>
                </div>
                <Link href={`/dashboard/instructor/${klass.id}`}>
                  <Button size="sm">View</Button>
                </Link>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-foreground">Classes You Joined</h2>
          </div>
          <div className="space-y-3">
            {studentClasses.length === 0 && (
              <p className="text-sm text-muted-foreground">You are not enrolled in any class.</p>
            )}
            {studentClasses.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">{entry.class?.name}</p>
                  <p className="text-xs text-muted-foreground">Code: {entry.class?.enrollment_code || "—"}</p>
                </div>
                <Link href={`/dashboard/instructor/${entry.class?.id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
