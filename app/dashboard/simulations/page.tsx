import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Stethoscope, Clock, Target, CheckCircle, Play, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

async function getSimulations(userId: string) {
  const supabase = await createClient()
  
  // Get all simulations
  const { data: simulations } = await supabase
    .from("case_simulations")
    .select(`
      *,
      topic:topics(id, name, icon)
    `)
    .order("created_at", { ascending: false })

  // Get user progress
  const { data: progress } = await supabase
    .from("user_case_progress")
    .select("*")
    .eq("user_id", userId)

  const progressMap = new Map(progress?.map(p => [p.case_id, p]) || [])

  return simulations?.map(sim => ({
    ...sim,
    progress: progressMap.get(sim.id) || null
  })) || []
}

export default async function SimulationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const simulations = await getSimulations(user.id)

  const completed = simulations.filter(s => s.progress?.completed === true).length
  const inProgress = simulations.filter(s => s.progress && !s.progress.completed).length

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Case Simulations</h1>
          <p className="text-muted-foreground mt-1">
            Practice clinical decision-making with interactive patient scenarios
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{simulations.length}</p>
            <p className="text-sm text-muted-foreground">Total Cases</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </GlassCard>
      </div>

      {/* Simulations Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Available Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {simulations.map((sim) => (
            <SimulationCard key={sim.id} simulation={sim} />
          ))}
        </div>
      </div>

      {simulations.length === 0 && (
        <GlassCard className="text-center py-12">
          <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No simulations available</h3>
          <p className="text-muted-foreground">Check back soon for new case studies</p>
        </GlassCard>
      )}
    </div>
  )
}

function SimulationCard({ simulation }: { simulation: {
  id: string
  title: string
  description: string | null
  difficulty: string
  estimated_minutes: number | null
  topic: { id: string; name: string; icon: string | null } | null
  progress: { completed: boolean; score: number | null; completed_at: string | null } | null
}}) {
  const isCompleted = simulation.progress?.completed
  const isInProgress = simulation.progress && !simulation.progress.completed
  const score = simulation.progress?.score

  return (
    <GlassCard hover className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{simulation.topic?.icon || "🏥"}</span>
          <span className="text-sm text-muted-foreground">{simulation.topic?.name || "General"}</span>
        </div>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          simulation.difficulty === "hard" ? "bg-destructive/20 text-destructive" :
          simulation.difficulty === "medium" ? "bg-warning/20 text-warning" :
          "bg-success/20 text-success"
        )}>
          {simulation.difficulty}
        </span>
      </div>

      <h3 className="font-semibold text-foreground mb-2">{simulation.title}</h3>
      {simulation.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{simulation.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {simulation.estimated_minutes || 15} min
        </span>
        {isCompleted && score !== null && (
          <span className="flex items-center gap-1 text-success">
            <Target className="w-4 h-4" />
            Score: {score}%
          </span>
        )}
        {isInProgress && (
          <span className="flex items-center gap-1 text-warning">
            <AlertCircle className="w-4 h-4" />
            In Progress
          </span>
        )}
      </div>

      <Link href={`/dashboard/simulations/${simulation.id}`} className="mt-auto">
        <Button 
          variant={status === "completed" ? "outline" : "default"} 
          className={cn(
            "w-full",
            status !== "completed" && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {status === "completed" ? (
            <>Review Case</>
          ) : status === "in_progress" ? (
            <><Play className="w-4 h-4 mr-2" />Continue</>
          ) : (
            <><Play className="w-4 h-4 mr-2" />Start Case</>
          )}
        </Button>
      </Link>
    </GlassCard>
  )
}
