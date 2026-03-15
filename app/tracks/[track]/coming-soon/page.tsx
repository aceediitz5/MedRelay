import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { TrackWaitlistForm } from "@/components/waitlist/track-waitlist-form"
import { getTrackBySlug } from "@/lib/tracks"

async function getProgress(trackSlug: string) {
  const supabase = await createClient()
  const track = getTrackBySlug(trackSlug)
  if (!track) return null

  const examType = track.examType || track.slug
  const topics = track.topics || []

  let topicIds: string[] = []
  if (topics.length > 0) {
    const { data: topicRows } = await supabase
      .from("topics")
      .select("id, name")
      .in("name", topics)
    topicIds = (topicRows || []).map((t) => t.id)
  }

  const { count: questions } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("exam_type", examType)

  const { count: flashcards } = topicIds.length
    ? await supabase
        .from("flashcards")
        .select("id", { count: "exact", head: true })
        .in("topic_id", topicIds)
    : { count: 0 as number | null }

  const { count: practiceExams } = await supabase
    .from("practice_exams")
    .select("id", { count: "exact", head: true })
    .eq("exam_type", examType)

  return {
    questions: questions || 0,
    flashcards: flashcards || 0,
    practiceExams: practiceExams || 0,
  }
}

export default async function TrackComingSoonPage({
  params,
}: {
  params: { track: string }
}) {
  const track = getTrackBySlug(params.track)
  if (!track) return notFound()

  const progress = await getProgress(track.slug)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {track.name} Prep Coming Soon
          </h1>
          <p className="text-muted-foreground">
            We’re building a full question bank, flashcards, simulations, and practice exams for this track.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Get notified at launch</h2>
          <TrackWaitlistForm track={track.slug} />
        </div>

        {progress && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="text-2xl font-bold text-foreground">{progress.questions} / 3000</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-sm text-muted-foreground">Flashcards</p>
              <p className="text-2xl font-bold text-foreground">{progress.flashcards} / 1500</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-sm text-muted-foreground">Practice Exams</p>
              <p className="text-2xl font-bold text-foreground">{progress.practiceExams} / 10</p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
