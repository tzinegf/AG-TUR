import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  phone?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const storedUser = await AsyncStorage.getItem('@AGTur:user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    // TODO: Implement Supabase authentication
    const mockUser = { id: '1', email };
    setUser(mockUser);
    await AsyncStorage.setItem('@AGTur:user', JSON.stringify(mockUser));
  }

  async function signUp(email: string, password: string, name?: string, phone?: string) {
    // TODO: Implement Supabase registration
    const mockUser = { id: '1', email, name, phone };
    setUser(mockUser);
    await AsyncStorage.setItem('@AGTur:user', JSON.stringify(mockUser));
  }

  async function signOut() {
    try {
      setLoading(true);
      setUser(null);
      await AsyncStorage.removeItem('@AGTur:user');
      // Clear any other stored data if needed
      await AsyncStorage.removeItem('@AGTur:bookings');
      await AsyncStorage.removeItem('@AGTur:preferences');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
