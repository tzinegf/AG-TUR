// Deno Edge Function: Stripe minimal backend
// Routes:
// POST /customer
// GET  /payment-methods
// POST /setup-intent
// DELETE /payment-methods/:id
// POST /payment-intent

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
// Allow non-SUPABASE_* names due to CLI restrictions
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("PROJECT_URL")!;
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("ANON_KEY")!;

const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const supabaseAuthClient = (authHeader: string | null) =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader ?? "" } },
  });

// Dev bypass: permite chamadas sem Authorization em ambiente de desenvolvimento
const ALLOW_DEV_BYPASS = (Deno.env.get("ALLOW_DEV_BYPASS") ?? "").toLowerCase() === "true";
const DEV_TEST_USER_ID = Deno.env.get("DEV_TEST_USER_ID") ?? null;

async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  // Em desenvolvimento, ignore autenticação e use um usuário fictício
  if (ALLOW_DEV_BYPASS && DEV_TEST_USER_ID) {
    return { id: DEV_TEST_USER_ID } as any;
  }
  if (!authHeader) {
    return null;
  }
  const rawToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const { data, error } = await supabaseAuthClient(authHeader).auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

async function ensureStripeCustomer(userId: string) {
  // Bypass de desenvolvimento: cria customer sem persistir em banco
  if (ALLOW_DEV_BYPASS) {
    const body = new URLSearchParams();
    body.append("description", `Dev user ${userId}`);
    const res = await fetch(`${STRIPE_API_BASE}/customers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
      body,
    });
    if (!res.ok) throw new Error(`Stripe error creating customer: ${await res.text()}`);
    const json = await res.json();
    return json.id as string;
  }

  const { data } = await supabaseService
    .from("stripe_customers")
    .select("customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (data?.customer_id) return data.customer_id as string;

  const { data: profile } = await supabaseService
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  const email = profile?.email ?? undefined;

  const body = new URLSearchParams();
  if (email) body.append("email", email);
  const res = await fetch(`${STRIPE_API_BASE}/customers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    body,
  });
  if (!res.ok) throw new Error(`Stripe error creating customer: ${await res.text()}`);
  const json = await res.json();
  const customerId = json.id as string;
  await supabaseService.from("stripe_customers").upsert({ user_id: userId, customer_id: customerId });
  return customerId;
}

async function listPaymentMethods(customerId: string) {
  const params = new URLSearchParams({ customer: customerId, type: "card" });
  const res = await fetch(`${STRIPE_API_BASE}/payment_methods?${params.toString()}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) throw new Error(`Stripe error listing payment methods: ${await res.text()}`);
  const json = await res.json();
  return (json.data ?? []).map((pm: any) => ({
    id: pm.id,
    brand: pm.card?.brand,
    last4: pm.card?.last4,
    exp_month: pm.card?.exp_month,
    exp_year: pm.card?.exp_year,
    funding: pm.card?.funding,
  }));
}

async function createSetupIntent(customerId: string) {
  const body = new URLSearchParams({ customer: customerId, usage: "on_session" });
  const res = await fetch(`${STRIPE_API_BASE}/setup_intents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    body,
  });
  if (!res.ok) throw new Error(`Stripe error creating setup intent: ${await res.text()}`);
  const json = await res.json();

  // Ephemeral key for mobile Payment Sheet (optional)
  const ekRes = await fetch(`${STRIPE_API_BASE}/ephemeral_keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Stripe-Version": "2023-10-16",
    },
    body: new URLSearchParams({ customer: customerId }),
  });
  const ekJson = ekRes.ok ? await ekRes.json() : null;
  return { clientSecret: json.client_secret, ephemeralKey: ekJson?.secret, customerId };
}

async function detachPaymentMethod(pmId: string) {
  const res = await fetch(`${STRIPE_API_BASE}/payment_methods/${pmId}/detach`, {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) throw new Error(`Stripe error detaching payment method: ${await res.text()}`);
  return { success: true };
}

async function createPaymentIntent(customerId: string, bodyJson: any) {
  const { amount, currency } = bodyJson ?? {};
  if (!amount || !currency) throw new Error("amount e currency são obrigatórios");
  const params = new URLSearchParams({
    amount: String(amount),
    currency,
    customer: customerId,
  });
  // Stripe expects nested param for automatic payment methods
  params.append("automatic_payment_methods[enabled]", "true");
  const res = await fetch(`${STRIPE_API_BASE}/payment_intents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    body: params,
  });
  if (!res.ok) throw new Error(`Stripe error creating payment intent: ${await res.text()}`);
  const json = await res.json();
  return { clientSecret: json.client_secret, paymentIntentId: json.id };
}

serve(async (req) => {
  try {
    const user = await getUser(req);
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/stripe\/?/, "/");

    if (req.method === "POST" && path === "/customer") {
      const customerId = await ensureStripeCustomer(user.id);
      return Response.json({ customerId });
    }

    if (req.method === "GET" && path === "/payment-methods") {
      const customerId = await ensureStripeCustomer(user.id);
      const list = await listPaymentMethods(customerId);
      return Response.json(list);
    }

    if (req.method === "POST" && path === "/setup-intent") {
      const customerId = await ensureStripeCustomer(user.id);
      const res = await createSetupIntent(customerId);
      return Response.json(res);
    }

    if (req.method === "DELETE" && path.startsWith("/payment-methods/")) {
      const pmId = path.split("/").pop()!;
      const result = await detachPaymentMethod(pmId);
      return Response.json(result);
    }

    if (req.method === "POST" && path === "/payment-intent") {
      const customerId = await ensureStripeCustomer(user.id);
      const bodyJson = await req.json().catch(() => ({}));
      const result = await createPaymentIntent(customerId, bodyJson);
      return Response.json(result);
    }

    return new Response("Not Found", { status: 404 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
});