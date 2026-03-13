"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Stethoscope, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"

const studentTypes = [
  { value: "emt_basic", label: "EMT Basic" },
  { value: "emt_advanced", label: "EMT Advanced" },
  { value: "paramedic", label: "Paramedic" },
  { value: "pre_med", label: "Pre-Med" },
  { value: "medical_student", label: "Medical Student" },
  { value: "nursing", label: "Nursing" },
  { value: "other", label: "Other Healthcare" },
]

// Map URL track params to student type values
const trackToStudentType: Record<string, string> = {
  emt: "emt_basic",
  nursing: "nursing",
  premed: "pre_med",
  medschool: "medical_student",
}

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [studentType, setStudentType] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Pre-select student type based on track query param
  useEffect(() => {
    const track = searchParams.get("track")
    if (track && trackToStudentType[track]) {
      setStudentType(trackToStudentType[track])
    }
  }, [searchParams])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
          student_type: studentType,
          role: "student",
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push("/auth/sign-up-success")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative animate-fade-in-up">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-sm group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">MedRelay</span>
        </Link>

        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground mt-2">Start your medical education journey today</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-scale-in" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-primary/50 transition-all"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="studentType" className="text-sm font-medium text-foreground">
                I am a...
              </label>
              <Select value={studentType} onValueChange={setStudentType} required>
                <SelectTrigger className="h-12 bg-input border-border focus:ring-2 focus:ring-primary/50 transition-all">
                  <SelectValue placeholder="Select your track" />
                </SelectTrigger>
                <SelectContent>
                  {studentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 btn-hover-lift text-base"
              disabled={loading || !studentType}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 rounded">
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
