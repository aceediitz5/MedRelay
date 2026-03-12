import { createClient } from "@/lib/supabase/server"
import { QuestionPractice } from "@/components/questions/question-practice"

async function getQuestions(userId: string, topicId?: string, mode?: string) {
  const supabase = await createClient()
  
  // Get user progress to filter
  const { data: progress } = await supabase
    .from("user_question_progress")
    .select("question_id, is_correct")
    .eq("user_id", userId)

  const progressMap = new Map(progress?.map(p => [p.question_id, p.is_correct]) || [])
  
  // Build query
  let query = supabase
    .from("questions")
    .select(`
      *,
      topic:topics(id, name, icon)
    `)
    .order("created_at")

  if (topicId) {
    query = query.eq("topic_id", topicId)
  }

  const { data: questions } = await query

  let filteredQuestions = questions || []

  // Filter based on mode
  if (mode === "weak") {
    filteredQuestions = filteredQuestions.filter(q => progressMap.get(q.id) === false)
  } else if (mode === "new") {
    filteredQuestions = filteredQuestions.filter(q => !progressMap.has(q.id))
  } else if (mode === "random") {
    // Shuffle for random mode
    filteredQuestions = filteredQuestions.sort(() => Math.random() - 0.5)
  }

  // Limit to 20 questions per session
  return filteredQuestions.slice(0, 20)
}

export default async function QuestionPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; mode?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const questions = await getQuestions(user.id, params.topic, params.mode)

  return (
    <QuestionPractice 
      questions={questions} 
      userId={user.id}
      mode={params.mode || "mixed"}
    />
  )
}
