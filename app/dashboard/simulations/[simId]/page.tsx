import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CaseSimulation } from "@/components/simulations/case-simulation"

async function getSimulation(simId: string, userId: string) {
  const supabase = await createClient()
  
  const { data: simulation } = await supabase
    .from("case_simulations")
    .select(`
      *,
      topic:topics(id, name, icon)
    `)
    .eq("id", simId)
    .single()

  if (!simulation) return null

  const { data: progress } = await supabase
    .from("user_case_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("case_id", simId)
    .single()

  return {
    simulation,
    progress
  }
}

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ simId: string }>
}) {
  const { simId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const data = await getSimulation(simId, user.id)
  
  if (!data) {
    notFound()
  }

  return (
    <CaseSimulation 
      simulation={data.simulation} 
      progress={data.progress}
      userId={user.id}
    />
  )
}
