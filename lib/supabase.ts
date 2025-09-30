import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://flxqngznhmdrvzoqdjtw.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseHFuZ3puaG1kcnZ6b3FkanR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5ODE4ODQsImV4cCI6MjA3MzU1Nzg4NH0.Uf_kCuMA5oVlzJZlfXg9HD3zLZMUjq0Og0NvZWIpD4A';

// Use different storage for web and native
const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface BusRoute {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  total_seats: number;
  bus_company: string;
  bus_type: string;
  amenities?: string[];
  duration?: string;
  status: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  route_id: string;
  seat_number: string;
  passenger_name: string;
  passenger_document: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  route_id: string;
  seat_number: string;
  passenger_name: string;
  passenger_document: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Bus {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  seats: number;
  type: 'convencional' | 'executivo' | 'leito';
  status: 'active' | 'maintenance' | 'inactive';
  amenities?: string[];
  imageurl?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}
