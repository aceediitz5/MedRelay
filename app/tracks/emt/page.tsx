import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Stethoscope,
  BookOpen,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Activity,
  Ambulance,
  Wind,
  Heart,
  Siren,
  Baby,
  Pill,
  Brain,
  Thermometer,
  Shield,
  Zap,
  HeartPulse,
  CheckCircle,
} from "lucide-react"

// EMT-specific topics
const emtTopics = [
  { icon: Activity, name: "Patient Assessment", color: "text-cyan-400", questions: 120, flashcards: 85, cases: 15 },
  { icon: Wind, name: "Airway Management", color: "text-sky-400", questions: 95, flashcards: 70, cases: 12 },
  { icon: Heart, name: "Cardiology", color: "text-red-400", questions: 110, flashcards: 90, cases: 18 },
  { icon: Wind, name: "Respiratory Emergencies", color: "text-blue-400", questions: 85, flashcards: 65, cases: 14 },
  { icon: HeartPulse, name: "Shock & Resuscitation", color: "text-rose-400", questions: 75, flashcards: 55, cases: 10 },
  { icon: Siren, name: "Trauma", color: "text-orange-400", questions: 130, flashcards: 100, cases: 20 },
  { icon: Pill, name: "Pharmacology", color: "text-purple-400", questions: 90, flashcards: 80, cases: 8 },
  { icon: Thermometer, name: "Toxicology", color: "text-lime-400", questions: 60, flashcards: 45, cases: 10 },
  { icon: Shield, name: "Environmental Emergencies", color: "text-green-400", questions: 55, flashcards: 40, cases: 8 },
  { icon: Zap, name: "EMS Operations", color: "text-amber-400", questions: 70, flashcards: 50, cases: 5 },
  { icon: Baby, name: "OB & Pediatrics", color: "text-pink-400", questions: 80, flashcards: 60, cases: 12 },
  { icon: Brain, name: "Neurology", color: "text-indigo-400", questions: 65, flashcards: 50, cases: 10 },
]

const contentTypes = [
  {
    icon: BookOpen,
    title: "Flashcards",
    count: "790+",
    description: "Master EMT terminology, protocols, and medication dosages with spaced repetition",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: HelpCircle,
    title: "Practice Questions",
    count: "1,035+",
    description: "NREMT-style questions with detailed explanations and rationales",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  {
    icon: Stethoscope,
    title: "Case Simulations",
    count: "142+",
    description: "Realistic field scenarios from MVAs to cardiac arrests",
    gradient: "from-indigo-500/20 to-purple-500/20",
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
        stroke="url(#ecg-gradient-emt)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-ecg"
      />
      <defs>
        <linearGradient id="ecg-gradient-emt" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(249 115 22 / 0)" />
          <stop offset="20%" stopColor="rgb(249 115 22 / 0.3)" />
          <stop offset="50%" stopColor="rgb(249 115 22 / 0.6)" />
          <stop offset="80%" stopColor="rgb(249 115 22 / 0.3)" />
          <stop offset="100%" stopColor="rgb(249 115 22 / 0)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function EMTTrackPage() {
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
              <Link href="/auth/sign-up?track=emt">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-400 hover:to-red-400 border-0">
                  Start EMT Track
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
        
        {/* ECG Line Background */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 opacity-30 pointer-events-none">
          <ECGLine className="w-full h-24" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          {/* Back Link */}
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>All Tracks</span>
          </Link>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-8 ml-4">
            <Ambulance className="w-4 h-4" />
            <span>EMT & Paramedic Track</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Master
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-400">
              Pre-Hospital Care
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Ace your NREMT certification with comprehensive training in BLS/ALS protocols, 
            trauma assessment, and real-world field scenarios. Every call counts.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up?track=emt">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-400 hover:to-red-400 text-lg px-8 h-14 shadow-lg shadow-orange-500/25">
                Start EMT Track <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Exam Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {["NREMT-B", "NREMT-P", "NREMT-A", "State Certifications"].map((exam) => (
              <span key={exam} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                {exam}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/5 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Complete EMT Learning System
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Every learning format you need to pass your certification and excel in the field.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {contentTypes.map((type) => (
              <div
                key={type.title}
                className={`relative overflow-hidden rounded-2xl border border-white/10 p-8 bg-gradient-to-br ${type.gradient}`}
              >
                <div className="flex flex-col h-full">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                    <type.icon className="w-7 h-7 text-orange-400" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{type.count}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{type.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              EMT Curriculum Topics
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Comprehensive coverage aligned with NREMT and state certification requirements.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emtTopics.map((topic) => (
              <div
                key={topic.name}
                className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${topic.color}`}>
                    <topic.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-2">{topic.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>{topic.flashcards} cards</span>
                      <span>•</span>
                      <span>{topic.questions} questions</span>
                      <span>•</span>
                      <span>{topic.cases} cases</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/10 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for First Responders
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "NREMT Exam Simulator", description: "Practice with timed tests that mirror the real exam format" },
              { title: "Protocol Quick Reference", description: "Instant access to BLS, ALS, and PALS protocols" },
              { title: "Field Scenario Training", description: "Make critical decisions in realistic emergency situations" },
              { title: "Medication Dose Calculator", description: "Master drug calculations with interactive practice" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-4 p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <CheckCircle className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your EMT Journey?
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of EMTs and paramedics who passed their certification with MedRelay.
          </p>
          <Link href="/auth/sign-up?track=emt">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-400 hover:to-red-400 text-lg px-10 h-14 shadow-lg shadow-orange-500/25">
              Start Learning Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400">MedRelay</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 MedRelay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
