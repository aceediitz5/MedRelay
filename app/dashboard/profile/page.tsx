"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Mail, GraduationCap, Save, Loader2, CheckCircle } from "lucide-react"

const studentTypes = [
  { value: "emt_basic", label: "EMT Basic" },
  { value: "emt_advanced", label: "EMT Advanced" },
  { value: "paramedic", label: "Paramedic" },
  { value: "pre_med", label: "Pre-Med" },
  { value: "medical_student", label: "Medical Student" },
  { value: "nursing", label: "Nursing" },
  { value: "other", label: "Other Healthcare" },
]

interface Profile {
  full_name: string | null
  student_type: string | null
  institution: string | null
  graduation_year: number | null
}

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    student_type: "",
    institution: "",
    graduation_year: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || "" })
        
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || authUser.user_metadata?.full_name || "",
            student_type: profileData.student_type || authUser.user_metadata?.student_type || "",
            institution: profileData.institution || "",
            graduation_year: profileData.graduation_year || null,
          })
        } else {
          setProfile({
            full_name: authUser.user_metadata?.full_name || "",
            student_type: authUser.user_metadata?.student_type || "",
            institution: "",
            graduation_year: null,
          })
        }
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    const supabase = createClient()

    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: profile.full_name,
        student_type: profile.student_type,
        institution: profile.institution,
        graduation_year: profile.graduation_year,
        updated_at: new Date().toISOString(),
      })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pt-12 lg:pt-0 max-w-2xl animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <GlassCard className="card-hover">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {profile.full_name || "Student"}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-primary/50 transition-all"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                className="pl-10 h-12 bg-input border-border opacity-60"
                disabled
                aria-describedby="email-hint"
              />
            </div>
            <p id="email-hint" className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          {/* Student Type */}
          <div className="space-y-2">
            <label htmlFor="studentType" className="text-sm font-medium text-foreground">
              Student Type
            </label>
            <Select 
              value={profile.student_type || ""} 
              onValueChange={(value) => setProfile({ ...profile, student_type: value })}
            >
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

          {/* Institution */}
          <div className="space-y-2">
            <label htmlFor="institution" className="text-sm font-medium text-foreground">
              Institution (Optional)
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                id="institution"
                type="text"
                placeholder="Your school or program"
                value={profile.institution || ""}
                onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                className="pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-primary/50 transition-all"
                autoComplete="organization"
              />
            </div>
          </div>

          {/* Graduation Year */}
          <div className="space-y-2">
            <label htmlFor="graduationYear" className="text-sm font-medium text-foreground">
              Expected Graduation Year (Optional)
            </label>
            <Input
              id="graduationYear"
              type="number"
              placeholder="2025"
              min={2020}
              max={2035}
              value={profile.graduation_year || ""}
              onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value ? parseInt(e.target.value) : null })}
              className="h-12 bg-input border-border focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 btn-hover-lift"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
            {saved && (
              <span className="text-sm text-green-400 animate-fade-in">Changes saved successfully</span>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
