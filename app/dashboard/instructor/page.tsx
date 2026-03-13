import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  Flame,
  Zap,
  HelpCircle,
  Stethoscope,
  BarChart3,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

async function getInstructorData(userId: string) {
  const supabase = await createClient()
  
  // Get instructor's classes with student count
  const { data: classes } = await supabase
    .from("instructor_classes")
    .select(`
      *,
      class_students(student_id)
    `)
    .eq("instructor_id", userId)
    .order("created_at", { ascending: false })

  // Get all student IDs from all classes
  const allStudentIds = classes?.flatMap(cls => 
    (cls.class_students as { student_id: string }[])?.map(s => s.student_id) || []
  ) || []
  
  const uniqueStudentIds = [...new Set(allStudentIds)]

  // Get student profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, study_streak, total_xp")
    .in("id", uniqueStudentIds.length > 0 ? uniqueStudentIds : [""])

  // Get aggregate stats
  const { data: flashcardProgress } = await supabase
    .from("user_flashcard_progress")
    .select("user_id, times_reviewed")
    .in("user_id", uniqueStudentIds.length > 0 ? uniqueStudentIds : [""])

  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select("user_id, is_correct")
    .in("user_id", uniqueStudentIds.length > 0 ? uniqueStudentIds : [""])

  const { data: caseProgress } = await supabase
    .from("user_case_progress")
    .select("user_id, completed")
    .in("user_id", uniqueStudentIds.length > 0 ? uniqueStudentIds : [""])

  // Get today's activity
  const today = new Date().toISOString().split("T")[0]
  const { data: todayLogs } = await supabase
    .from("daily_study_logs")
    .select("user_id")
    .in("user_id", uniqueStudentIds.length > 0 ? uniqueStudentIds : [""])
    .eq("study_date", today)

  // Calculate totals
  const totalStudents = uniqueStudentIds.length
  const totalCards = flashcardProgress?.reduce((acc, p) => acc + (p.times_reviewed || 1), 0) || 0
  const totalQuestions = questionProgress?.length || 0
  const correctAnswers = questionProgress?.filter(q => q.is_correct)?.length || 0
  const avgAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  const totalCases = caseProgress?.filter(c => c.completed)?.length || 0
  const activeToday = new Set(todayLogs?.map(l => l.user_id) || []).size
  const totalXp = profiles?.reduce((acc, p) => acc + (p.total_xp || 0), 0) || 0
  const avgStreak = profiles && profiles.length > 0
    ? Math.round(profiles.reduce((acc, p) => acc + (p.study_streak || 0), 0) / profiles.length)
    : 0

  // Add student counts to classes
  const classesWithStats = classes?.map(cls => ({
    ...cls,
    studentCount: (cls.class_students as { student_id: string }[])?.length || 0,
  })) || []

  return {
    classes: classesWithStats,
    totalStudents,
    totalCards,
    totalQuestions,
    avgAccuracy,
    totalCases,
    activeToday,
    totalXp,
    avgStreak,
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

      {/* Overall Analytics */}
      <GlassCard glow>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Overall Analytics</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Users className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{data.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Students</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{data.activeToday}</p>
            <p className="text-xs text-muted-foreground">Active Today</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Target className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{data.avgAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{data.totalCards.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Cards</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <HelpCircle className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{data.totalQuestions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Stethoscope className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{data.totalCases}</p>
            <p className="text-xs text-muted-foreground">Cases</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Flame className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{data.avgStreak}</p>
            <p className="text-xs text-muted-foreground">Avg Streak</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{data.totalXp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
        </div>
      </GlassCard>

      {/* Classes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Classes</h2>
          <span className="text-sm text-muted-foreground">{data.classes.length} classes</span>
        </div>
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
        <Link href="/dashboard/instructor/create-class">
          <GlassCard hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Create New Class</h3>
                <p className="text-sm text-muted-foreground">Set up a new class for your students</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </GlassCard>
        </Link>
        <GlassCard hover>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">View Reports</h3>
              <p className="text-sm text-muted-foreground">Track student progress and performance</p>
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
  studentCount: number
}}) {
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
            {classData.studentCount} students
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
