import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      <main className="lg:pl-64">
        <div className="min-h-screen p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
