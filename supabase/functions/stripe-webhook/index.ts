import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2023-10-16' })

const PRICE_TO_PLAN: Record<string, string> = {
  [Deno.env.get('STRIPE_PRICE_BASIC') ?? '']: 'basic',
  [Deno.env.get('STRIPE_PRICE_PREMIUM') ?? '']: 'premium',
  [Deno.env.get('STRIPE_PRICE_ANNUAL') ?? '']: 'annual',
}

serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return new Response(`Webhook error: ${(err as Error).message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const sub = event.data.object as Stripe.Subscription

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated'
  ) {
    const priceId = sub.items.data[0]?.price?.id ?? ''
    const plan = PRICE_TO_PLAN[priceId] ?? 'unknown'
    const userId = sub.metadata?.user_id

    if (userId) {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer as string,
        plan,
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const userId = sub.metadata?.user_id
    if (userId) {
      await supabase.from('subscriptions').update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
