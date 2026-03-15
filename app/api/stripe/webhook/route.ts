import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
})

function getStatusIsPro(status: string | null) {
  return status === "active" || status === "trialing"
}

function addMonths(date: Date, months: number) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error("Webhook signature verification failed.", error)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id || session.client_reference_id || null
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id

        if (!userId || !customerId) break

        if (session.mode === "subscription") {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id

          await supabase
            .from("profiles")
            .update({
              is_pro: true,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId || null,
            })
            .eq("id", userId)
        }

        if (session.mode === "payment") {
          const examPackageId = session.metadata?.exam_package_id
          const bundleExamPackageId = session.metadata?.bundle_exam_package_id
          const bundleProMonths = Number(session.metadata?.bundle_pro_months || "0")
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id

          const finalExamPackageId = bundleExamPackageId || examPackageId

          if (finalExamPackageId) {
            await supabase.from("exam_purchases").upsert(
              {
                user_id: userId,
                exam_package_id: finalExamPackageId,
                stripe_customer_id: customerId,
                stripe_payment_intent_id: paymentIntentId || null,
                stripe_checkout_session_id: session.id,
                amount_total: session.amount_total || null,
                currency: session.currency || null,
              },
              { onConflict: "user_id,exam_package_id" }
            )
          }

          if (bundleProMonths > 0) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("pro_granted_until")
              .eq("id", userId)
              .single()

            const now = new Date()
            const currentGrant = profile?.pro_granted_until ? new Date(profile.pro_granted_until) : null
            const base = currentGrant && currentGrant > now ? currentGrant : now
            const newGrant = addMonths(base, bundleProMonths)

            await supabase
              .from("profiles")
              .update({
                is_pro: true,
                pro_granted_until: newGrant.toISOString(),
              })
              .eq("id", userId)
          }
        }
        break
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id

        if (!customerId) break

        const isPro = getStatusIsPro(subscription.status)

        await supabase
          .from("profiles")
          .update({
            is_pro: isPro,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
          })
          .eq("stripe_customer_id", customerId)

        break
      }
      default:
        break
    }
  } catch (error) {
    console.error("Webhook handler error", error)
    return new NextResponse("Webhook handler error", { status: 500 })
  }

  return new NextResponse("ok", { status: 200 })
}
