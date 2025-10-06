import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

// Fallback: usa a URL do Supabase para construir a base das Functions
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://flxqngznhmdrvzoqdjtw.supabase.co';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1`;
const DEV_BYPASS = (process.env.EXPO_PUBLIC_ALLOW_DEV_BYPASS || '').toLowerCase() === 'true';
const DEV_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  exp_month?: number;
  exp_year?: number;
  funding?: string;
};

export type CreateSetupIntentResponse = {
  clientSecret?: string;
  ephemeralKey?: string;
  customerId?: string;
  redirectUrl?: string; // Fallback para WebView/Checkout
};

export type CreatePaymentIntentResponse = {
  clientSecret?: string;
  paymentIntentId?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    const msg = 'API_BASE_URL não configurado. Defina EXPO_PUBLIC_API_BASE_URL no .env';
    console.warn(msg);
    Alert.alert('Configuração ausente', msg);
    throw new Error(msg);
  }
  const url = `${API_BASE_URL.replace(/\/$/, '')}${path}`;
  const { data } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (DEV_BYPASS && DEV_ANON_KEY) {
    console.warn('Sem sessão; usando DEV bypass com anon key para Authorization.');
    headers.Authorization = `Bearer ${DEV_ANON_KEY}`;
  }
  const res = await fetch(url, {
    headers,
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ${res.status}: ${text}`);
  }
  return res.json();
}

export const stripeService = {
  async getOrCreateCustomer(): Promise<{ customerId: string }> {
    // O backend deve usar o usuário autenticado para mapear um customer do Stripe
    return request('/stripe/customer', { method: 'POST' });
  },

  async listPaymentMethods(): Promise<PaymentMethod[]> {
    return request('/stripe/payment-methods', { method: 'GET' });
  },

  async createSetupIntent(): Promise<CreateSetupIntentResponse> {
    return request('/stripe/setup-intent', { method: 'POST' });
  },

  async detachPaymentMethod(paymentMethodId: string): Promise<{ success: boolean }> {
    return request(`/stripe/payment-methods/${paymentMethodId}`, { method: 'DELETE' });
  },

  async createPaymentIntent(body: { amount: number; currency: string }): Promise<CreatePaymentIntentResponse> {
    return request('/stripe/payment-intent', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};