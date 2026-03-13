import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, ArrowRight, Layers, Clock, CheckCircle } from "lucide-react"

async function getFlashcardDecks(userId: string) {
  const supabase = await createClient()
  
  // Get all decks with topics
  const { data: decks } = await supabase
    .from("flashcard_decks")
    .select(`
      *,
      topic:topics(id, name, icon),
      flashcards(id)
    `)
    .order("created_at", { ascending: false })

  // Get user progress for each deck
  const { data: progress } = await supabase
    .from("user_flashcard_progress")
    .select("flashcard_id, difficulty")
    .eq("user_id", userId)

  const progressMap = new Map(progress?.map(p => [p.flashcard_id, p.difficulty]) || [])

  return decks?.map(deck => {
    const flashcardIds = (deck.flashcards as { id: string }[])?.map(f => f.id) || []
    const studiedCards = flashcardIds.filter(id => progressMap.has(id)).length
    const masteredCards = flashcardIds.filter(id => progressMap.get(id) === "easy").length
    
    return {
      ...deck,
      totalCards: flashcardIds.length,
      studiedCards,
      masteredCards,
    }
  }) || []
}

async function getTopics() {
  const supabase = await createClient()
  const { data } = await supabase.from("topics").select("*").order("name")
  return data || []
}

export default async function FlashcardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const [decks, topics] = await Promise.all([
    getFlashcardDecks(user.id),
    getTopics()
  ])

  // Group decks by topic
  const decksByTopic = topics.map(topic => ({
    topic,
    decks: decks.filter(d => (d.topic as { id: string } | null)?.id === topic.id)
  })).filter(group => group.decks.length > 0)

  const uncategorizedDecks = decks.filter(d => !d.topic)

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flashcards</h1>
          <p className="text-muted-foreground mt-1">
            Master medical concepts with spaced repetition
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
            <Layers className="w-4 h-4" />
            <span className="font-medium">{decks.length} Decks</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {decks.reduce((acc, d) => acc + d.totalCards, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Cards</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {decks.reduce((acc, d) => acc + d.studiedCards, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Cards Studied</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {decks.reduce((acc, d) => acc + d.masteredCards, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Cards Mastered</p>
          </div>
        </GlassCard>
      </div>

      {/* Decks by Topic */}
      {decksByTopic.map(({ topic, decks: topicDecks }) => (
        <div key={topic.id} className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            {topic.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        </div>
      ))}

      {/* Uncategorized */}
      {uncategorizedDecks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uncategorizedDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        </div>
      )}

      {decks.length === 0 && (
        <GlassCard className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No flashcard decks yet</h3>
          <p className="text-muted-foreground mb-6">
            Check back soon for new study materials
          </p>
        </GlassCard>
      )}
    </div>
  )
}

function DeckCard({ deck }: { deck: { 
  id: string
  title: string
  description: string | null
  totalCards: number
  studiedCards: number
  masteredCards: number
}}) {
  const progress = deck.totalCards > 0 ? Math.round((deck.masteredCards / deck.totalCards) * 100) : 0
  
  return (
    <Link href={`/dashboard/flashcards/${deck.id}`}>
      <GlassCard hover className="h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground">
            {deck.totalCards} cards
          </span>
        </div>
        <h3 className="font-semibold text-foreground mb-1">{deck.title}</h3>
        {deck.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{deck.description}</p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mastered</span>
            <span className="text-foreground font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-4 text-primary">
          Study Now <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </GlassCard>
    </Link>
  )
}
