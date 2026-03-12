import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { FlashcardStudy } from "@/components/flashcards/flashcard-study"

async function getDeckWithCards(deckId: string, userId: string) {
  const supabase = await createClient()
  
  // Get deck
  const { data: deck } = await supabase
    .from("flashcard_decks")
    .select(`
      *,
      topic:topics(id, name, icon)
    `)
    .eq("id", deckId)
    .single()

  if (!deck) return null

  // Get cards
  const { data: cards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .order("created_at")

  // Get user progress
  const { data: progress } = await supabase
    .from("user_flashcard_progress")
    .select("*")
    .eq("user_id", userId)
    .in("flashcard_id", cards?.map(c => c.id) || [])

  const progressMap = new Map(progress?.map(p => [p.flashcard_id, p]) || [])

  const cardsWithProgress = cards?.map(card => ({
    ...card,
    progress: progressMap.get(card.id) || null
  })) || []

  return {
    deck,
    cards: cardsWithProgress
  }
}

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const data = await getDeckWithCards(deckId, user.id)
  
  if (!data) {
    notFound()
  }

  return (
    <FlashcardStudy 
      deck={data.deck} 
      cards={data.cards} 
      userId={user.id}
    />
  )
}
