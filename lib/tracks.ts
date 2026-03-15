export type TrackStatus = "active" | "coming_soon"

export type TrackConfig = {
  slug: string
  name: string
  status: TrackStatus
  examType?: string
  topics?: string[]
}

export const TRACKS: TrackConfig[] = [
  {
    slug: "emt",
    name: "EMT",
    status: "active",
    examType: "nremt",
    topics: ["Patient Assessment", "Airway Management", "Cardiology", "Trauma", "EMS Operations", "Pharmacology"],
  },
  {
    slug: "paramedic",
    name: "Paramedic",
    status: "coming_soon",
    examType: "paramedic",
    topics: ["Advanced Airway", "Cardiac Arrest", "Pharmacology", "Trauma Management", "Special Populations"],
  },
  {
    slug: "nursing",
    name: "Nursing",
    status: "coming_soon",
    examType: "nclex",
    topics: ["Pharmacology", "Med-Surg", "Pediatrics", "Mental Health", "Maternal-Newborn", "Critical Care"],
  },
  {
    slug: "premed",
    name: "Pre-Med",
    status: "coming_soon",
    examType: "mcat",
    topics: ["Biochemistry", "Biology", "Chemistry", "Physics", "Psychology", "Sociology"],
  },
  {
    slug: "medschool",
    name: "Med School",
    status: "coming_soon",
    examType: "usmle",
    topics: ["Anatomy", "Pathology", "Pharmacology", "Physiology", "Biochemistry", "Microbiology"],
  },
]

export function getTrackBySlug(slug: string) {
  return TRACKS.find((track) => track.slug === slug) || null
}

export function getTrackByProgramType(programType?: string | null) {
  if (!programType) return null
  if (programType.startsWith("emt")) return getTrackBySlug("emt")
  if (programType === "paramedic") return getTrackBySlug("paramedic")
  if (programType === "nursing") return getTrackBySlug("nursing")
  if (programType === "pre_med") return getTrackBySlug("premed")
  if (programType === "medical_student") return getTrackBySlug("medschool")
  return null
}
