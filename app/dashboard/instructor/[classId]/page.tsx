import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { AssignmentForm } from "@/components/instructor/assignment-form"
import { ClassAnalytics } from "@/components/instructor/class-analytics"
import { ClipboardList, CalendarDays } from "lucide-react"

export default async function InstructorClassPage({
  params,
}: {
  params: { classId: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: klass } = await supabase
    .from("instructor_classes")
    .select("id, name, enrollment_code, created_at")
    .eq("id", params.classId)
    .single()

  const { count: studentCount } = await supabase
    .from("class_students")
    .select("id", { count: "exact", head: true })
    .eq("class_id", params.classId)

  const { data: assignments } = await supabase
    .from("class_assignments")
    .select("id, title, description, due_date, created_at")
    .eq("class_id", params.classId)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{klass?.name || "Class"}</h1>
        <p className="text-muted-foreground mt-1">
          Enrollment code: {klass?.enrollment_code || "—"}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Assignments</p>
            <p className="text-xl font-bold text-foreground">{assignments?.length || 0}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Students</p>
            <p className="text-xl font-bold text-foreground">{studentCount || 0}</p>
          </div>
        </GlassCard>
      </div>

      <ClassAnalytics classId={params.classId} />

      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">Create Assignment</h2>
        <AssignmentForm classId={params.classId} onCreated={() => {}} />
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">Assignments</h2>
        <div className="space-y-3">
          {(assignments || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          )}
          {(assignments || []).map((assignment) => (
            <div key={assignment.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{assignment.title}</p>
                  {assignment.description && (
                    <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  {assignment.due_date || "No due date"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

