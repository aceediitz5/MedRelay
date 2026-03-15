import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import {
  Stethoscope,
  BookOpen,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Star,
  Activity,
  Siren,
  Layers,
  Sparkles,
  X,
  Crown,
  GraduationCap,
  Ambulance,
  Hospital,
  Microscope,
  Zap,
  Shield,
  FileText,
  Brain,
  Pill,
  ClipboardList,
  Mail,
  Send,
  MessageSquare,
} from "lucide-react"

// Expanded medical topics - comprehensive healthcare coverage (topic-focused, no body part icons)
const medicalTopics = [
  { icon: FileText, name: "Anatomy & Physiology", color: "text-amber-400" },
  { icon: Activity, name: "Cardiology", color: "text-red-400" },
  { icon: ClipboardList, name: "Gastrointestinal", color: "text-green-400" },
  { icon: Pill, name: "Pharmacology", color: "text-purple-400" },
  { icon: Activity, name: "Respiratory", color: "text-sky-400" },
  { icon: Brain, name: "Neurology", color: "text-pink-400" },
  { icon: Siren, name: "Trauma & Emergency", color: "text-orange-400" },
  { icon: ClipboardList, name: "OB/GYN & Pediatrics", color: "text-rose-400" },
  { icon: Microscope, name: "Hematology", color: "text-red-300" },
  { icon: FileText, name: "Endocrinology", color: "text-yellow-400" },
  { icon: Shield, name: "Immunology", color: "text-blue-400" },
  { icon: Microscope, name: "Infectious Disease", color: "text-lime-400" },
  { icon: FileText, name: "Ophthalmology", color: "text-cyan-300" },
  { icon: FileText, name: "ENT", color: "text-indigo-400" },
  { icon: Activity, name: "Nephrology", color: "text-teal-400" },
  { icon: FileText, name: "Radiology & Imaging", color: "text-violet-400" },
  { icon: ClipboardList, name: "Surgery", color: "text-slate-300" },
  { icon: Activity, name: "Critical Care", color: "text-red-500" },
  { icon: Zap, name: "Emergency Medicine", color: "text-amber-500" },
  { icon: Microscope, name: "Pathology", color: "text-fuchsia-400" },
]

// Student tracks with curriculum paths
const studentTracks = [
  {
    icon: Ambulance,
    title: "EMT",
    slug: "emt",
    status: "active",
    description: "NREMT prep, BLS protocols, field scenarios",
    exams: ["NREMT-B", "State Certs"],
    color: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-400",
  },
  {
    icon: Ambulance,
    title: "Paramedic",
    slug: "paramedic",
    status: "coming_soon",
    description: "Advanced ALS care, critical patient management",
    exams: ["NREMT-P", "State Certs"],
    color: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
  },
  {
    icon: Hospital,
    title: "Nursing",
    slug: "nursing",
    status: "coming_soon",
    description: "NCLEX-RN/PN prep, clinical skills, patient care",
    exams: ["NCLEX-RN", "NCLEX-PN", "CCRN"],
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    iconColor: "text-pink-400",
  },
  {
    icon: Microscope,
    title: "Pre-Med",
    slug: "premed",
    status: "coming_soon",
    description: "MCAT fundamentals, core sciences, research methods",
    exams: ["MCAT", "DAT", "OAT"],
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30",
    iconColor: "text-cyan-400",
  },
  {
    icon: GraduationCap,
    title: "Medical School",
    slug: "medschool",
    status: "coming_soon",
    description: "USMLE Step prep, clinical rotations, boards review",
    exams: ["USMLE Step 1", "USMLE Step 2", "COMLEX"],
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
  },
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
    role: "Emergency Medicine Resident",
    content: "Finally a platform that makes medical education adaptive and personalized to my learning style.",
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
      { text: "All 20+ topics", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "Everything you need to pass",
    features: [
      { text: "2,000+ flashcards", included: true },
      { text: "Full question bank (1,000+)", included: true },
      { text: "Advanced analytics", included: true },
      { text: "All 20+ topics unlocked", included: true },
      { text: "All case simulations", included: true },
      { text: "Exam mode & timed tests", included: true },
      { text: "Offline access", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Pro",
    popular: true,
  },
]

// Exam prep packages - one-time purchases
const examPackages = [
  { name: "NREMT Certification Prep", price: 99, duration: "8-12 weeks", flashcards: 150, questions: 200, simulations: 15 },
  { name: "Paramedic Certification Prep", price: 129, duration: "12-16 weeks", flashcards: 200, questions: 280, simulations: 20 },
  { name: "NCLEX Nursing Prep", price: 149, duration: "10-14 weeks", flashcards: 250, questions: 350, simulations: 18 },
  { name: "MCAT Foundations", price: 199, duration: "16-20 weeks", flashcards: 300, questions: 400, simulations: 12 },
  { name: "USMLE Step 1 Prep", price: 249, duration: "20-24 weeks", flashcards: 350, questions: 500, simulations: 25 },
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
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm font-medium hidden sm:block">
                Contact
              </a>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 border-0 btn-hover-lift">
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
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
              <Activity className="w-4 h-4" />
              <span>A Better Way to Study Medicine</span>
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal animation="fade-up" delay={200}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Your Patients Are Counting
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400">
                On Your Knowledge.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              MedRelay delivers adaptive flashcards, rigorous question banks, and realistic case simulations — 
              everything you need to pass your certification and save lives.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal animation="fade-up" delay={400}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 text-lg px-8 h-14 shadow-lg shadow-cyan-500/25 btn-hover-lift">
                  Start Learning Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-gray-700 text-gray-300 hover:bg-white/5 hover:text-white">
                  See Plans
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <p className="mt-6 text-sm text-gray-500">
              Free forever plan available. Upgrade anytime.
            </p>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal animation="fade-up" delay={500}>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5">
              {[
{ value: "4K+", label: "Flashcards" },
              { value: "5K+", label: "Practice Questions" },
              { value: "100+", label: "Clinical Case Learning" },
              { value: "5", label: "Exam-Focused Content" },
              ].map((stat, index) => (
                <ScrollReveal key={stat.label} animation="scale" delay={100 * index}>
                  <div className="text-center">
                    <p className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Student Tracks Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Choose Your Path
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Tailored curricula for every healthcare career. Select your track and get a personalized study plan.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentTracks.map((track, index) => (
              <ScrollReveal key={track.title} animation="fade-up" delay={100 * index}>
                <Link
                  href={track.status === "coming_soon" ? `/tracks/${track.slug}/coming-soon` : `/tracks/${track.slug}`}
                  className={`group relative rounded-2xl border ${track.borderColor} bg-gradient-to-br ${track.color} p-6 hover:scale-[1.02] transition-all duration-300 block h-full`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-4 ${track.iconColor}`}>
                    <track.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{track.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{track.description}</p>
                  <div className="mb-3">
                    {track.status === "active" ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                        Available
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {track.exams.map((exam) => (
                      <span key={exam} className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                        {exam}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                    {track.status === "active" ? "Explore Track" : "View Details"}{" "}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Every Topic. Every Specialty.
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Comprehensive coverage across 20+ medical disciplines. Deep content built for EMS, Nursing, and Medical School.
              </p>
            </div>
          </ScrollReveal>

          {/* Topics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-16">
            {medicalTopics.map((topic, index) => (
              <ScrollReveal key={topic.name} animation="scale" delay={30 * index} duration={400}>
                <div
                  className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300 cursor-pointer"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${topic.color}`}>
                      <topic.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors leading-tight">{topic.name}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Content Types Legend */}
          <ScrollReveal animation="fade-up">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Every topic includes all three content types
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
                {contentTypes.map((type, index) => (
                  <ScrollReveal key={type.title} animation="fade-up" delay={100 * index}>
                    <div
                      className={`relative overflow-hidden rounded-2xl border border-white/10 p-6 bg-gradient-to-br ${type.gradient} h-full`}
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
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works / Value Prop */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Built for Results, Not Busywork
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Every feature is designed to maximize your study efficiency and exam performance.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Track",
                description: "Select EMS, Nursing, Pre-Med, or Medical School. Your curriculum auto-adapts to your certification path.",
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
            ].map((item, index) => (
              <ScrollReveal key={item.step} animation="fade-up" delay={150 * index}>
                <div className="relative group h-full">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Start free. Upgrade when you need unlimited access to all content and features.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <ScrollReveal key={plan.name} animation="fade-up" delay={150 * index}>
                <div
                  className={`relative rounded-3xl p-8 h-full ${
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

                {plan.popular && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Cancel anytime. No questions asked.
                    </p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Prep Packages Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                <span>Exam Prep Packages</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Individual Certification Prep
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Purchase exam prep packages separately. One-time payment, lifetime access.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {examPackages.map((pkg, index) => (
              <ScrollReveal key={pkg.name} animation="fade-up" delay={80 * index}>
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300 h-full flex flex-col">
                  <h3 className="font-semibold text-white text-sm mb-2">{pkg.name}</h3>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-white">${pkg.price}</span>
                    <span className="text-xs text-gray-500 ml-1">one-time</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-3">{pkg.duration}</div>
                  <ul className="space-y-1.5 text-xs text-gray-400 mb-4 flex-1">
                    <li>{pkg.flashcards}+ flashcards</li>
                    <li>{pkg.questions}+ questions</li>
                    <li>{pkg.simulations} simulations</li>
                  </ul>
                  <Link href="/auth/sign-up">
                    <Button size="sm" variant="outline" className="w-full text-xs border-white/10 hover:bg-white/5">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Trusted by Future Lifesavers
              </h2>
              <p className="text-lg text-gray-400">
                Join thousands who passed their exams with MedRelay.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={testimonial.name} animation="fade-up" delay={100 * index}>
                <GlassCard className="bg-white/[0.02] border-white/5 h-full">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal animation="scale">
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
                  {"Don't"} leave your certification to chance. Start studying smarter today.
                </p>
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 text-lg px-10 h-14 shadow-lg shadow-cyan-500/25 btn-hover-lift">
                    Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <p className="mt-6 text-sm text-gray-500">
                  Free forever plan. No credit card required.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 to-transparent" />
        <div className="max-w-4xl mx-auto relative">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <MessageSquare className="w-4 h-4" />
                <span>Get in Touch</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Contact Us
              </h2>
              <p className="text-lg text-gray-400 max-w-xl mx-auto">
                Have questions about MedRelay? Want to partner with us? {"We'd"} love to hear from you.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <ScrollReveal animation="fade-right">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 h-full">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                Send us a Message
              </h3>
              <form
                action={`https://formsubmit.co/medrelay.help@gmail.com`}
                method="POST"
                className="space-y-5"
              >
                <input type="hidden" name="_subject" value="New MedRelay Contact Form Submission" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all input-focus-glow"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all input-focus-glow"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none input-focus-glow"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 btn-hover-lift"
                >
                  Send Message <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
              </div>
            </ScrollReveal>

            {/* Direct Contact Info */}
            <ScrollReveal animation="fade-left" delay={100}>
              <div className="space-y-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  Direct Contact
                </h3>
                <p className="text-gray-400 mb-4">
                  Prefer to reach out directly? Send us an email and {"we'll"} get back to you within 24 hours.
                </p>
                <a
                  href="mailto:medrelay.help@gmail.com"
                  className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all group"
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">medrelay.help@gmail.com</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-8">
                <h4 className="text-lg font-semibold text-white mb-3">Quick Response Time</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Our support team typically responds within 24 hours during business days. For urgent matters, 
                  please include {"'URGENT'"} in your subject line.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-cyan-400">
                  <Activity className="w-4 h-4" />
                  <span>Average response: 12 hours</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">We can help with:</h4>
                <ul className="space-y-2">
                  {["Technical support", "Account & billing", "Partnership inquiries", "Feature requests", "Bug reports"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-semibold text-white">MedRelay</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
              <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
              <a href="mailto:medrelay.help@gmail.com" className="hover:text-cyan-400 transition-colors">Support</a>
            </div>
            <p className="text-sm text-gray-500">
              2024 MedRelay. Built for the future of medical education.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
