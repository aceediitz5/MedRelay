import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  ArrowLeft,
  GraduationCap,
  Users,
  Copy,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Clock,
  Stethoscope,
  Flame,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentStats {
  cardsStudied: number
  questionsAnswered: number
  questionsCorrect: number
  accuracy: number
  casesCompleted: number
  studyStreak: number
  totalXp: number
  level: number
  lastActive: string | null
}

async function getClassData(classId: string, userId: string) {
  const supabase = await createClient()
  
  const { data: classData } = await supabase
    .from("instructor_classes")
    .select(`
      *,
      class_students(
        id,
        joined_at,
        student_id
      )
    `)
    .eq("id", classId)
    .eq("instructor_id", userId)
    .single()

  if (!classData) return null

  // Get student IDs
  const studentIds = (classData.class_students as { student_id: string }[])
    ?.map(m => m.student_id)
    .filter(Boolean) || []

  if (studentIds.length === 0) {
    return {
      ...classData,
      students: [],
      classStats: {
        avgAccuracy: 0,
        totalCards: 0,
        totalQuestions: 0,
        totalCases: 0,
        avgStreak: 0,
        totalXp: 0,
        activeToday: 0,
      }
    }
  }

  // Get student profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, program_type, study_streak, total_xp, level, last_study_date")
    .in("id", studentIds)

  // Get progress data for each student
  const { data: flashcardProgress } = await supabase
    .from("user_flashcard_progress")
    .select("user_id, times_reviewed")
    .in("user_id", studentIds)

  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select("user_id, is_correct")
    .in("user_id", studentIds)

  const { data: caseProgress } = await supabase
    .from("user_case_progress")
    .select("user_id, completed")
    .in("user_id", studentIds)

  // Get today's activity
  const today = new Date().toISOString().split("T")[0]
  const { data: todayLogs } = await supabase
    .from("daily_study_logs")
    .select("user_id")
    .in("user_id", studentIds)
    .eq("study_date", today)

  const activeToday = new Set(todayLogs?.map(l => l.user_id) || [])

  // Calculate stats per student
  const studentsWithStats = (classData.class_students as {
    id: string
    joined_at: string
    student_id: string
  }[])?.map(member => {
    const profile = profiles?.find(p => p.id === member.student_id)
    const cards = flashcardProgress?.filter(p => p.user_id === member.student_id) || []
    const questions = questionProgress?.filter(p => p.user_id === member.student_id) || []
    const cases = caseProgress?.filter(p => p.user_id === member.student_id && p.completed) || []
    const correct = questions.filter(q => q.is_correct).length
    const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0

    const stats: StudentStats = {
      cardsStudied: cards.reduce((acc, c) => acc + (c.times_reviewed || 1), 0),
      questionsAnswered: questions.length,
      questionsCorrect: correct,
      accuracy,
      casesCompleted: cases.length,
      studyStreak: profile?.study_streak || 0,
      totalXp: profile?.total_xp || 0,
      level: profile?.level || 1,
      lastActive: profile?.last_study_date || null,
    }

    return {
      id: member.id,
      joined_at: member.joined_at,
      student_id: member.student_id,
      username: profile?.username || "Unknown",
      program_type: profile?.program_type,
      stats,
      isActiveToday: activeToday.has(member.student_id),
    }
  }).sort((a, b) => b.stats.totalXp - a.stats.totalXp) || []

  // Calculate class-wide stats
  const classStats = {
    avgAccuracy: studentsWithStats.length > 0 
      ? Math.round(studentsWithStats.reduce((acc, s) => acc + s.stats.accuracy, 0) / studentsWithStats.length)
      : 0,
    totalCards: studentsWithStats.reduce((acc, s) => acc + s.stats.cardsStudied, 0),
    totalQuestions: studentsWithStats.reduce((acc, s) => acc + s.stats.questionsAnswered, 0),
    totalCases: studentsWithStats.reduce((acc, s) => acc + s.stats.casesCompleted, 0),
    avgStreak: studentsWithStats.length > 0
      ? Math.round(studentsWithStats.reduce((acc, s) => acc + s.stats.studyStreak, 0) / studentsWithStats.length)
      : 0,
    totalXp: studentsWithStats.reduce((acc, s) => acc + s.stats.totalXp, 0),
    activeToday: activeToday.size,
  }

  return {
    ...classData,
    students: studentsWithStats,
    classStats,
  }
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const classData = await getClassData(classId, user.id)
  
  if (!classData) {
    notFound()
  }

  // Identify students needing attention (low accuracy or inactive)
  const studentsNeedingAttention = classData.students.filter(s => 
    (s.stats.accuracy < 60 && s.stats.questionsAnswered >= 5) || 
    (s.stats.lastActive && new Date(s.stats.lastActive) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  )

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div>
        <Link href="/dashboard/instructor" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{classData.name}</h1>
            </div>
            {classData.description && (
              <p className="text-muted-foreground">{classData.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-lg bg-secondary flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Class Code:</span>
              <span className="font-mono font-bold text-foreground">{classData.class_code}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Class Analytics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <GlassCard className="flex flex-col items-center justify-center text-center p-4">
          <Users className="w-6 h-6 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">{classData.students.length}</p>
          <p className="text-xs text-muted-foreground">Students</p>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center text-center p-4">
          <CheckCircle className="w-6 h-6 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{classData.classStats.activeToday}</p>
          <p className="text-xs text-muted-foreground">Active Today</p>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center text-center p-4">
          <Target className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{classData.classStats.avgAccuracy}%</p>
          <p className="text-xs text-muted-foreground">Avg Accuracy</p>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center text-center p-4">
          <BookOpen className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{classData.classStats.totalCards}</p>
          <p className="text-xs text-muted-foreground">Cards Reviewed</p>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center text-center p-4">
          <HelpCircle className="w-6 h-6 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">{classData.classStats.totalQuestions}</p>
          <p className="text-xs text-muted-foreground">Questions</p>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center text-center p-4">
          <Stethoscope className="w-6 h-6 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{classData.classStats.totalCases}</p>
          <p className="text-xs text-muted-foreground">Cases Done</p>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center text-center p-4">
          <Flame className="w-6 h-6 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">{classData.classStats.avgStreak}</p>
          <p className="text-xs text-muted-foreground">Avg Streak</p>
        </GlassCard>
      </div>

      {/* Students Needing Attention */}
      {studentsNeedingAttention.length > 0 && (
        <GlassCard className="border-warning/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold text-foreground">Students Needing Attention</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsNeedingAttention.map((student) => (
              <div key={student.id} className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="font-medium text-foreground">{student.username}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {student.stats.accuracy < 60 && student.stats.questionsAnswered >= 5 && (
                    <span className="text-warning">Low accuracy: {student.stats.accuracy}%</span>
                  )}
                  {student.stats.lastActive && new Date(student.stats.lastActive) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <span className="text-warning">Inactive for 7+ days</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Students Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Student Progress</h2>
          </div>
          <span className="text-sm text-muted-foreground">{classData.students.length} enrolled</span>
        </div>

        {classData.students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Cards
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <HelpCircle className="w-4 h-4 inline mr-1" />
                    Questions
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <Target className="w-4 h-4 inline mr-1" />
                    Accuracy
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <Stethoscope className="w-4 h-4 inline mr-1" />
                    Cases
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <Flame className="w-4 h-4 inline mr-1" />
                    Streak
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <Zap className="w-4 h-4 inline mr-1" />
                    XP
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {classData.students.map((student, index) => (
                  <tr 
                    key={student.id} 
                    className={cn(
                      "border-b border-border/50 hover:bg-secondary/30 transition-colors",
                      student.isActiveToday && "bg-success/5"
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <span className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            index === 0 && "bg-yellow-500/20 text-yellow-400",
                            index === 1 && "bg-gray-400/20 text-gray-400",
                            index === 2 && "bg-amber-700/20 text-amber-700"
                          )}>
                            {index + 1}
                          </span>
                        )}
                        <div>
                          <span className="font-medium text-foreground">{student.username}</span>
                          {student.isActiveToday && (
                            <span className="ml-2 text-xs text-success">Active today</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground capitalize">
                        {student.program_type?.replace(/_/g, " ") || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-foreground">{student.stats.cardsStudied}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-foreground">{student.stats.questionsAnswered}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress 
                          value={student.stats.accuracy} 
                          className={cn(
                            "w-16 h-2",
                            student.stats.accuracy >= 70 ? "[&>div]:bg-success" :
                            student.stats.accuracy >= 50 ? "[&>div]:bg-warning" :
                            "[&>div]:bg-destructive"
                          )}
                        />
                        <span className={cn(
                          "font-medium text-sm w-12",
                          student.stats.accuracy >= 70 ? "text-success" :
                          student.stats.accuracy >= 50 ? "text-warning" :
                          student.stats.accuracy > 0 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {student.stats.questionsAnswered > 0 ? `${student.stats.accuracy}%` : "--"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-foreground">{student.stats.casesCompleted}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1",
                        student.stats.studyStreak >= 7 ? "text-warning" : "text-muted-foreground"
                      )}>
                        <Flame className="w-4 h-4" />
                        {student.stats.studyStreak}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-yellow-400 font-medium">
                        <Zap className="w-4 h-4" />
                        {student.stats.totalXp.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {student.stats.lastActive 
                          ? new Date(student.stats.lastActive).toLocaleDateString()
                          : "Never"
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No students yet</h3>
            <p className="text-muted-foreground mb-4">
              Share your class code <span className="font-mono font-bold">{classData.class_code}</span> with students to join
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
