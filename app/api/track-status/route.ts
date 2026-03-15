import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getTrackByProgramType } from "@/lib/tracks"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ status: "active", slug: null })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("program_type")
      .eq("id", user.id)
      .single()

    const track = getTrackByProgramType(profile?.program_type)
    return NextResponse.json({
      status: track?.status || "active",
      slug: track?.slug || null,
      name: track?.name || null,
    })
  } catch (error) {
    console.error("Track status error:", error)
    return NextResponse.json({ status: "active", slug: null })
  }
}
