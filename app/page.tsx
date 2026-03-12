import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Stethoscope,
  BookOpen,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Star,
  Heart,
  Brain,
  Pill,
  Wind,
  Bone,
  Activity,
  Baby,
  Siren,
  Layers,
  Sparkles,
  X,
  Crown,
} from "lucide-react"

const medicalTopics = [
  { icon: Bone, name: "Anatomy", color: "text-amber-400" },
  { icon: Heart, name: "Cardiology", color: "text-red-400" },
  { icon: Activity, name: "Gastrointestinal", color: "text-green-400" },
  { icon: Pill, name: "Pharmacology", color: "text-purple-400" },
  { icon: Wind, name: "Respiratory", color: "text-sky-400" },
  { icon: Brain, name: "Neurology", color: "text-pink-400" },
  { icon: Siren, name: "Trauma", color: "text-orange-400" },
  { icon: Baby, name: "OB/GYN", color: "text-rose-400" },
]

const contentTypes = [
  {
    icon: BookOpen,
    title: "Flashcards",
    description: "Spaced repetition for long-term retention",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: HelpCircle,
    title: "Questions",
    description: "NREMT & USMLE-style practice",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  {
    icon: Stethoscope,
    title: "Simulations",
    description: "Interactive clinical scenarios",
    gradient: "from-indigo-500/20 to-purple-500/20",
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

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the basics",
    features: [
      { text: "100 flashcards per topic", included: true },
      { text: "50 practice questions", included: true },
      { text: "Basic progress tracking", included: true },
      { text: "2 topics unlocked", included: true },
      { text: "Case simulations", included: false },
      { text: "All 8 topics", included: false },
      { text: "Instructor tools", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "Everything you need to pass",
    features: [
      { text: "Unlimited flashcards", included: true },
      { text: "Full question bank (15K+)", included: true },
      { text: "Advanced analytics", included: true },
      { text: "All 8 topics unlocked", included: true },
      { text: "All case simulations", included: true },
      { text: "Exam mode & timed tests", included: true },
      { text: "Offline access", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Pro",
    popular: true,
  },
]

// ECG Line SVG Component
function ECGLine({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M0 50 L100 50 L120 50 L140 45 L160 55 L180 50 L200 50 L220 50 L240 20 L260 80 L280 10 L300 90 L320 50 L340 50 L400 50 L420 50 L440 45 L460 55 L480 50 L500 50 L520 50 L540 20 L560 80 L580 10 L600 90 L620 50 L640 50 L700 50 L720 50 L740 45 L760 55 L780 50 L800 50 L820 50 L840 20 L860 80 L880 10 L900 90 L920 50 L940 50 L1000 50 L1020 50 L1040 45 L1060 55 L1080 50 L1100 50 L1120 50 L1140 20 L1160 80 L1180 10 L1200 90"
        stroke="url(#ecg-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-ecg"
      />
      <defs>
        <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(6 182 212 / 0)" />
          <stop offset="20%" stopColor="rgb(6 182 212 / 0.3)" />
          <stop offset="50%" stopColor="rgb(6 182 212 / 0.6)" />
          <stop offset="80%" stopColor="rgb(6 182 212 / 0.3)" />
          <stop offset="100%" stopColor="rgb(6 182 212 / 0)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080c10]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080c10]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-xl font-bold text-white">MedRelay</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 border-0">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        
        {/* ECG Line Background */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 opacity-30 pointer-events-none">
          <ECGLine className="w-full h-24" />
        </div>
        <div className="absolute top-1/3 left-0 right-0 opacity-15 pointer-events-none">
          <ECGLine className="w-full h-16" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
            <Activity className="w-4 h-4" />
            <span>Trusted by 10,000+ Medical Professionals</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Your Patients Are Counting
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400">
              On Your Knowledge.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            MedRelay delivers adaptive flashcards, rigorous question banks, and realistic case simulations — 
            everything you need to pass your certification and save lives.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 text-lg px-8 h-14 shadow-lg shadow-cyan-500/25">
                Start Learning Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-gray-700 text-gray-300 hover:bg-white/5 hover:text-white">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-500" /> No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-500" /> Cancel anytime
            </span>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5">
            {[
              { value: "10K+", label: "Active Students" },
              { value: "50K+", label: "Flashcards" },
              { value: "15K+", label: "Practice Questions" },
              { value: "98%", label: "Pass Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Master Every Topic
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Comprehensive coverage across all major medical disciplines. Deep content, not shallow overviews.
            </p>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {medicalTopics.map((topic) => (
              <div
                key={topic.name}
                className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center text-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${topic.color}`}>
                    <topic.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-200 group-hover:text-white transition-colors">{topic.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Content Types Legend */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Every topic includes all three content types
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
              {contentTypes.map((type) => (
                <div
                  key={type.title}
                  className={`relative overflow-hidden rounded-2xl border border-white/10 p-6 bg-gradient-to-br ${type.gradient}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <type.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{type.title}</h3>
                      <p className="text-sm text-gray-400">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works / Value Prop */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Results, Not Busywork
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Every feature is designed to maximize your study efficiency and exam performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Track",
                description: "Select EMS, pre-med, or nursing. Content auto-adapts to your certification exam.",
                icon: Sparkles,
              },
              {
                step: "02",
                title: "Study Adaptively",
                description: "Our algorithm focuses your time on weak areas. No more wasting hours on what you already know.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Pass with Confidence",
                description: "Timed practice exams and realistic simulations prepare you for test-day pressure.",
                icon: CheckCircle,
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="absolute -inset-px bg-gradient-to-b from-cyan-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-8 h-full">
                  <span className="text-5xl font-bold text-cyan-500/20">{item.step}</span>
                  <div className="mt-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Start free. Upgrade when you're ready for unlimited access.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? "bg-gradient-to-b from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/30"
                    : "bg-white/[0.02] border border-white/5"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/25">
                      <Crown className="w-4 h-4" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">/ {plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-gray-300" : "text-gray-600"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/auth/sign-up" className="block">
                  <Button
                    className={`w-full h-12 text-base ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/20"
                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by Future Lifesavers
            </h2>
            <p className="text-lg text-gray-400">
              Join thousands who passed their exams with MedRelay.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <GlassCard key={testimonial.name} className="bg-white/[0.02] border-white/5">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">{`"${testimonial.content}"`}</p>
                <div className="border-t border-white/5 pt-4">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/10" />
            <div className="absolute inset-0 bg-[#080c10]/60" />
            
            <div className="relative p-12 sm:p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Your Future Patients Need You Ready.
              </h2>
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
                Don't leave your certification to chance. Start studying smarter today.
              </p>
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 text-lg px-10 h-14 shadow-lg shadow-cyan-500/25">
                  Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-cyan-500" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-cyan-500" /> Free tier available
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-semibold text-white">MedRelay</span>
          </div>
          <p className="text-sm text-gray-500">
            2024 MedRelay. Built for the future of medical education.
          </p>
        </div>
      </footer>

    </div>
  )
}
