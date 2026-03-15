import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getCurrentUser } from "@/lib/auth" // replace with your auth function
import { prisma } from "@/lib/prisma" // if using Prisma or replace with your DB

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
})

export async function GET() {
  try {
    // 1️⃣ Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ purchasedExamIds: [], isPro: false })
    }

    // 2️⃣ Fetch subscriptions from your DB or Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      expand: ["data.default_payment_method"],
    })

    const isPro = subscriptions.data.some((sub) => {
      return sub.status === "active" || sub.status === "trialing"
    })

    // 3️⃣ Fetch purchased exam packages from your DB
    // Example with Prisma; adjust for your database
    const purchasedExams = await prisma.examPurchase.findMany({
      where: { userId: user.id },
      select: { packageId: true },
    })

    const purchasedExamIds = purchasedExams.map((p) => p.packageId)

    // 4️⃣ Return both subscription and exam purchase info
    return NextResponse.json({ purchasedExamIds, isPro })
  } catch (error) {
    console.error("Error fetching user purchases:", error)
    return NextResponse.json({ purchasedExamIds: [], isPro: false }, { status: 500 })
  }
}
