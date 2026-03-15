import { redirect } from "next/navigation"
import { getTrackBySlug } from "@/lib/tracks"

export default function ParamedicTrackPage() {
  const track = getTrackBySlug("paramedic")
  if (track?.status === "coming_soon") {
    redirect("/tracks/paramedic/coming-soon")
  }

  return null
}
