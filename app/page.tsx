import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Stethoscope,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Users,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Smart Flashcards",
    description: "Spaced repetition algorithm adapts to your learning pace for maximum retention.",
  },
  {
    icon: HelpCircle,
    title: "Question Bank",
    description: "Thousands of NREMT, USMLE-style questions with detailed explanations.",
  },
  {
    icon: Stethoscope,
    title: "Case Simulations",
    description: "Interactive patient scenarios to practice clinical decision-making.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Detailed analytics to identify strengths and areas for improvement.",
  },
  {
    icon: Users,
    title: "Instructor Dashboard",
    description: "Create classes, assign content, and monitor student performance.",
  },
  {
    icon: Shield,
    title: "Exam Ready",
    description: "Structured study paths aligned with certification exam blueprints.",
  },
]

const testimonials = [
  {
    name: "Sarah M.",
    role: "Paramedic Student",
    content: "MedRelay helped me pass my NREMT on the first try. The case simulations were incredibly realistic.",
    rating: 5,
  },
  {
    name: "James K.",
    role: "Medical Student",
    content: "The spaced repetition flashcards made studying for Step 1 so much more efficient.",
    rating: 5,
  },
  {
    name: "Dr. Emily Chen",
    role: "EMS Instructor",
    content: "Finally a platform that lets me track my students' progress and customize their learning path.",
    rating: 5,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">MedRelay</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-foreground">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Trusted by 10,000+ medical students
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight text-balance">
            Master Medical Knowledge with{" "}
            <span className="text-primary">Intelligent Learning</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Flashcards, question banks, and case simulations powered by spaced repetition. 
            Built for EMS, paramedic, pre-med, and medical students.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 glow">
                Start Learning Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See Features
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active Students" },
              { value: "50K+", label: "Flashcards" },
              { value: "15K+", label: "Questions" },
              { value: "98%", label: "Pass Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive study tools designed by medical professionals for future healthcare heroes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <GlassCard key={feature.title} hover>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Loved by Students & Instructors
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See what our community has to say about MedRelay.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <GlassCard key={testimonial.name}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-4">{`"${testimonial.content}"`}</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="text-center p-12" glow>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Accelerate Your Learning?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of medical students who are already using MedRelay to master their studies.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-success" /> No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-success" /> 7-day free trial
              </span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">MedRelay</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 MedRelay. Built for the future of medical education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
