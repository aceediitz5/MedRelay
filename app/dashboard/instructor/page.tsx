import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  GraduationCap,
  Users,
  BookOpen,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Target,
} from "lucide-react"

async function getInstructorData(userId: string) {
  const supabase = await createClient()
  
  // Get instructor's classes
  const { data: classes } = await supabase
    .from("instructor_classes")
    .select(`
      *,
      class_members(id, profiles(id, full_name))
    `)
    .eq("instructor_id", userId)
    .order("created_at", { ascending: false })

  // Get total students
  const totalStudents = classes?.reduce((acc, cls) => 
    acc + ((cls.class_members as { id: string }[])?.length || 0), 0) || 0

  return {
    classes: classes || [],
    totalStudents,
  }
}

export default async function InstructorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Check if user is an instructor
  const isInstructor = user.user_metadata?.role === "instructor"
  if (!isInstructor) {
    redirect("/dashboard")
  }

  const data = await getInstructorData(user.id)

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Instructor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your classes and track student progress
          </p>
        </div>
        <Link href="/dashboard/instructor/create-class">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Class
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.classes.length}</p>
            <p className="text-sm text-muted-foreground">Active Classes</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.totalStudents}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">--</p>
            <p className="text-sm text-muted-foreground">Avg. Performance</p>
          </div>
        </GlassCard>
      </div>

      {/* Classes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Your Classes</h2>
        {data.classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.classes.map((cls) => (
              <ClassCard key={cls.id} classData={cls} />
            ))}
          </div>
        ) : (
          <GlassCard className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No classes yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first class to start managing students
            </p>
            <Link href="/dashboard/instructor/create-class">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Class
              </Button>
            </Link>
          </GlassCard>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard hover>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Assign Content</h3>
              <p className="text-sm text-muted-foreground">Assign flashcard decks and questions to your classes</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </GlassCard>
        <GlassCard hover>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">View Reports</h3>
              <p className="text-sm text-muted-foreground">Track student progress and performance analytics</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function ClassCard({ classData }: { classData: {
  id: string
  name: string
  description: string | null
  class_code: string
  created_at: string
  class_members: { id: string; profiles: { full_name: string | null } | null }[]
}}) {
  const studentCount = classData.class_members?.length || 0
  const createdDate = new Date(classData.created_at).toLocaleDateString()

  return (
    <Link href={`/dashboard/instructor/class/${classData.id}`}>
      <GlassCard hover className="h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">
            {classData.class_code}
          </span>
        </div>
        <h3 className="font-semibold text-foreground mb-1">{classData.name}</h3>
        {classData.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{classData.description}</p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {studentCount} students
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {createdDate}
          </span>
        </div>
      </GlassCard>
    </Link>
  )
}
