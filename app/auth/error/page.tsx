import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Stethoscope, AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-sm">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">MedRelay</span>
        </Link>

        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Error</h1>
          <p className="text-muted-foreground mb-6">
            Something went wrong during authentication. Please try again or contact support if the problem persists.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/auth/login">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
