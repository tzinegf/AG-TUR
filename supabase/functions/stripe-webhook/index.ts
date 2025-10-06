import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "npm:stripe@12.18.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
// Allow non-SUPABASE_* names due to CLI restrictions
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("PROJECT_URL")!;
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Bad Request", { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = (pi.metadata?.booking_id as string) || null;
        await supabase.from("payments").upsert({
          transaction_id: pi.id,
          status: "completed",
          amount: (pi.amount_received ?? pi.amount ?? 0) / 100,
          method: pi.payment_method_types?.[0] ?? "card",
          booking_id: bookingId,
        });
        if (bookingId) {
          await supabase.from("bookings").update({ payment_status: "paid" }).eq("id", bookingId);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = (pi.metadata?.booking_id as string) || null;
        await supabase.from("payments").upsert({
          transaction_id: pi.id,
          status: "failed",
          amount: (pi.amount ?? 0) / 100,
          method: pi.payment_method_types?.[0] ?? "card",
          booking_id: bookingId,
        });
        if (bookingId) {
          await supabase.from("bookings").update({ payment_status: "pending" }).eq("id", bookingId);
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const bookingId = (charge.metadata?.booking_id as string) || null;
        await supabase.from("payments").upsert({
          transaction_id: charge.payment_intent as string,
          status: "refunded",
          amount: (charge.amount_refunded ?? 0) / 100,
          method: charge.payment_method_details?.type ?? "card",
          booking_id: bookingId,
        });
        if (bookingId) {
          await supabase.from("bookings").update({ payment_status: "refunded" }).eq("id", bookingId);
        }
        break;
      }
      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response("Webhook error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});