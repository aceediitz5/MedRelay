import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, Zap, Users, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic features",
    features: [
      "100 flashcard reviews/month",
      "50 practice questions/month",
      "3 case simulations",
      "Basic progress tracking",
      "Community support",
    ],
    cta: "Current Plan",
    current: true,
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "Everything you need to succeed",
    features: [
      "Unlimited flashcard reviews",
      "Unlimited practice questions",
      "All case simulations",
      "Advanced analytics",
      "Spaced repetition algorithm",
      "Offline mode",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    current: false,
    popular: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "Perfect for study groups & programs",
    features: [
      "Everything in Pro",
      "Up to 50 team members",
      "Instructor dashboard",
      "Class management",
      "Custom content creation",
      "Performance reports",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    current: false,
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/20 text-warning text-sm font-medium mb-4">
          <Crown className="w-4 h-4" />
          Upgrade Your Learning
        </div>
        <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Unlock your full potential with premium features designed to accelerate your medical education
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <GlassCard 
            key={plan.name} 
            className={cn(
              "flex flex-col relative",
              plan.popular && "ring-2 ring-primary"
            )}
            glow={plan.popular}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3" />
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
              <div className="mt-2">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className={cn(
                "w-full",
                plan.current 
                  ? "bg-secondary text-secondary-foreground" 
                  : plan.popular 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-sm"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
              disabled={plan.current}
            >
              {plan.name === "Team" && <Users className="w-4 h-4 mr-2" />}
              {plan.popular && <Zap className="w-4 h-4 mr-2" />}
              {plan.cta}
            </Button>
          </GlassCard>
        ))}
      </div>

      {/* FAQ */}
      <GlassCard className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-foreground mb-1">Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Is there a student discount?</h3>
            <p className="text-sm text-muted-foreground">
              We offer 50% off for verified students. Contact support with your student ID to get the discount applied.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through Stripe.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Can I switch plans?</h3>
            <p className="text-sm text-muted-foreground">
              {"Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
