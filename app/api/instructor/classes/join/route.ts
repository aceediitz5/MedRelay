import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code } = (await req.json()) as { code?: string }
  if (!code) {
    return NextResponse.json({ error: "Enrollment code required" }, { status: 400 })
  }

  const { data: klass } = await supabase
    .from("instructor_classes")
    .select("id, name")
    .eq("enrollment_code", code.toUpperCase())
    .single()

  if (!klass) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 })
  }

  const { error } = await supabase
    .from("class_students")
    .insert({ class_id: klass.id, student_id: user.id })

  if (error) {
    return NextResponse.json({ error: "Unable to join class" }, { status: 400 })
  }

  return NextResponse.json({ class: klass })
}
