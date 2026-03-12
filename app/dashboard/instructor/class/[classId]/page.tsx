import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

async function getClassData(classId: string, userId: string) {
  const supabase = await createClient()
  
  const { data: classData } = await supabase
    .from("instructor_classes")
    .select(`
      *,
      class_members(
        id,
        joined_at,
        student:profiles(id, full_name, student_type)
      )
    `)
    .eq("id", classId)
    .eq("instructor_id", userId)
    .single()

  if (!classData) return null

  // Get progress data for each student
  const studentIds = (classData.class_members as { student: { id: string } | null }[])
    ?.map(m => m.student?.id)
    .filter(Boolean) || []

  const { data: flashcardProgress } = await supabase
    .from("user_flashcard_progress")
    .select("user_id, confidence_level")
    .in("user_id", studentIds)

  const { data: questionProgress } = await supabase
    .from("user_question_progress")
    .select("user_id, is_correct")
    .in("user_id", studentIds)

  // Calculate stats per student
  const studentsWithStats = (classData.class_members as {
    id: string
    joined_at: string
    student: { id: string; full_name: string | null; student_type: string | null } | null
  }[])?.map(member => {
    const studentId = member.student?.id
    const cards = flashcardProgress?.filter(p => p.user_id === studentId) || []
    const questions = questionProgress?.filter(p => p.user_id === studentId) || []
    const correct = questions.filter(q => q.is_correct).length
    const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0

    return {
      ...member,
      stats: {
        cardsStudied: cards.length,
        questionsAnswered: questions.length,
        accuracy,
      }
    }
  }) || []

  return {
    ...classData,
    students: studentsWithStats,
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{classData.students.length}</p>
            <p className="text-sm text-muted-foreground">Students</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {classData.students.reduce((acc, s) => acc + s.stats.cardsStudied, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Cards Studied</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {classData.students.length > 0 
                ? Math.round(classData.students.reduce((acc, s) => acc + s.stats.accuracy, 0) / classData.students.length)
                : 0}%
            </p>
            <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
          </div>
        </GlassCard>
      </div>

      {/* Students Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Students</h2>
          <span className="text-sm text-muted-foreground">{classData.students.length} enrolled</span>
        </div>

        {classData.students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Track</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Cards
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <HelpCircle className="w-4 h-4 inline mr-1" />
                    Questions
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Accuracy
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {classData.students.map((member) => (
                  <tr key={member.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">
                        {member.student?.full_name || "Unknown"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground capitalize">
                        {member.student?.student_type?.replace(/_/g, " ") || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-foreground">{member.stats.cardsStudied}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-foreground">{member.stats.questionsAnswered}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        "font-medium",
                        member.stats.accuracy >= 70 ? "text-success" :
                        member.stats.accuracy >= 50 ? "text-warning" :
                        member.stats.accuracy > 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {member.stats.questionsAnswered > 0 ? `${member.stats.accuracy}%` : "--"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(member.joined_at).toLocaleDateString()}
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
