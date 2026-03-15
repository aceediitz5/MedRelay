import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
})

type CheckoutType = "subscription" | "payment"

const SUBSCRIPTION_PRICE_IDS = new Set([
  "price_1TAcXRHTnaP0wMR8HKQROxnf",
])

const EXAM_PRICE_MAP: Record<string, string> = {
  price_1TAcZiHTnaP0wMR8i8gXGLS1: "nremt",
  price_1TAcb1HTnaP0wMR8B1kztL3M: "paramedic",
  price_1TAcbMHTnaP0wMR8llyNupdV: "nclex",
  price_1TAcbjHTnaP0wMR8vB1uQ9ZQ: "mcat",
  price_1TAccWHTnaP0wMR8CiF5Z3Tk: "usmle",
}

function isValidPrice(priceId: string, type: CheckoutType) {
  if (type === "subscription") return SUBSCRIPTION_PRICE_IDS.has(priceId)
  return Boolean(EXAM_PRICE_MAP[priceId])
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId, type } = (await req.json()) as {
      priceId?: string
      type?: CheckoutType
    }

    if (!priceId || !type || !isValidPrice(priceId, type)) {
      return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    let customerId = profile?.stripe_customer_id || null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)
    }

    const examPackageId = type === "payment" ? EXAM_PRICE_MAP[priceId] : null

    const session = await stripe.checkout.sessions.create({
      mode: type,
      customer: customerId,
      client_reference_id: user.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/dashboard/pricing`,
      metadata: {
        user_id: user.id,
        exam_package_id: examPackageId || "",
      },
      subscription_data:
        type === "subscription"
          ? {
              metadata: {
                user_id: user.id,
              },
            }
          : undefined,
      payment_intent_data:
        type === "payment"
          ? {
              metadata: {
                user_id: user.id,
                exam_package_id: examPackageId || "",
              },
            }
          : undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
