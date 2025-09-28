import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email!,
        };
        
        await AsyncStorage.setItem('@AGTur:user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  signUp: async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email!,
          name: fullName,
        };
        
        await AsyncStorage.setItem('@AGTur:user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('@AGTur:user');
    set({ user: null, isAuthenticated: false });
  },

  loadSession: async () => {
    try {
      set({ isLoading: true });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email!,
        };
        set({ user, isAuthenticated: true });
      } else {
        const storedUser = await AsyncStorage.getItem('@AGTur:user');
        if (storedUser) {
          set({ user: JSON.parse(storedUser), isAuthenticated: true });
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
