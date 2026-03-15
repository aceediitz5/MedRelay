import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: instructorClasses } = await supabase
    .from("instructor_classes")
    .select("id, name, enrollment_code, created_at")
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false })

  const { data: studentClasses } = await supabase
    .from("class_students")
    .select("id, class:instructor_classes(id, name, enrollment_code, created_at)")
    .eq("student_id", user.id)

  return NextResponse.json({ instructorClasses: instructorClasses || [], studentClasses: studentClasses || [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name } = (await req.json()) as { name?: string }
  if (!name) {
    return NextResponse.json({ error: "Class name required" }, { status: 400 })
  }

  let code = generateCode()
  let attempts = 0
  while (attempts < 5) {
    const { data, error } = await supabase
      .from("instructor_classes")
      .insert({ instructor_id: user.id, name, enrollment_code: code.toUpperCase() })
      .select("id, name, enrollment_code, created_at")
      .single()

    if (!error && data) {
      return NextResponse.json({ class: data })
    }
    code = generateCode()
    attempts += 1
  }

  return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
}
