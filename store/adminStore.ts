import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
}

interface AdminState {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  loading: boolean;
  loginAdmin: (admin: AdminUser) => void;
  authenticateAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  loadAdminUser: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  adminUser: null,
  isAdminAuthenticated: false,
  loading: false,
  
  authenticateAdmin: async (email: string, password: string): Promise<boolean> => {
    set({ loading: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Predefined admin credentials
      const adminCredentials = [
        {
          email: 'admin@agtur.com',
          password: 'admin123',
          user: {
            id: 'admin-1',
            name: 'Administrador Principal',
            email: 'admin@agtur.com',
            role: 'admin' as const,
          }
        },
        {
          email: 'manager@agtur.com',
          password: 'manager123',
          user: {
            id: 'manager-1',
            name: 'Gerente de Operações',
            email: 'manager@agtur.com',
            role: 'manager' as const,
          }
        }
      ];
      
      const validCredential = adminCredentials.find(
        cred => cred.email === email && cred.password === password
      );
      
      if (validCredential) {
        await AsyncStorage.setItem('adminUser', JSON.stringify(validCredential.user));
        set({ 
          adminUser: validCredential.user, 
          isAdminAuthenticated: true,
          loading: false 
        });
        return true;
      } else {
        set({ loading: false });
        return false;
      }
    } catch (error) {
      console.error('Error authenticating admin:', error);
      set({ loading: false });
      return false;
    }
  },
  
  loginAdmin: async (admin: AdminUser) => {
    try {
      await AsyncStorage.setItem('adminUser', JSON.stringify(admin));
      set({ adminUser: admin, isAdminAuthenticated: true });
    } catch (error) {
      console.error('Error saving admin user:', error);
    }
  },
  
  logoutAdmin: async () => {
    try {
      set({ loading: true });
      await AsyncStorage.removeItem('adminUser');
      set({ adminUser: null, isAdminAuthenticated: false, loading: false });
    } catch (error) {
      console.error('Error removing admin user:', error);
      set({ loading: false });
    }
  },
  
  loadAdminUser: async () => {
    try {
      const adminData = await AsyncStorage.getItem('adminUser');
      if (adminData) {
        const admin = JSON.parse(adminData);
        set({ adminUser: admin, isAdminAuthenticated: true });
      }
    } catch (error) {
      console.error('Error loading admin user:', error);
    }
  },
}));
