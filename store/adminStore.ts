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
      // Primeiro, limpar qualquer estado de autenticação anterior
      await AsyncStorage.removeItem('adminUser');
      await AsyncStorage.removeItem('adminSessionTimestamp');
      set({ 
        adminUser: null, 
        isAdminAuthenticated: false 
      });
      
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
        const sessionTimestamp = Date.now().toString();
        await AsyncStorage.setItem('adminUser', JSON.stringify(validCredential.user));
        await AsyncStorage.setItem('adminSessionTimestamp', sessionTimestamp);
        set({ 
          adminUser: validCredential.user, 
          isAdminAuthenticated: true,
          loading: false 
        });
        return true;
      } else {
        // Limpar qualquer estado de autenticação anterior quando as credenciais são inválidas
        await AsyncStorage.removeItem('adminUser');
        await AsyncStorage.removeItem('adminSessionTimestamp');
        set({ 
          adminUser: null, 
          isAdminAuthenticated: false, 
          loading: false 
        });
        return false;
      }
    } catch (error) {
      console.error('Error authenticating admin:', error);
      // Limpar estado em caso de erro
      await AsyncStorage.removeItem('adminUser');
      await AsyncStorage.removeItem('adminSessionTimestamp');
      set({ 
        adminUser: null, 
        isAdminAuthenticated: false, 
        loading: false 
      });
      return false;
    }
  },
  
  loginAdmin: async (admin: AdminUser) => {
    try {
      const sessionTimestamp = Date.now().toString();
      await AsyncStorage.setItem('adminUser', JSON.stringify(admin));
      await AsyncStorage.setItem('adminSessionTimestamp', sessionTimestamp);
      set({ adminUser: admin, isAdminAuthenticated: true });
    } catch (error) {
      console.error('Error saving admin user:', error);
    }
  },
  
  logoutAdmin: async () => {
    try {
      set({ loading: true });
      await AsyncStorage.removeItem('adminUser');
      await AsyncStorage.removeItem('adminSessionTimestamp');
      set({ adminUser: null, isAdminAuthenticated: false, loading: false });
    } catch (error) {
      console.error('Error removing admin user:', error);
      set({ loading: false });
    }
  },
  
  loadAdminUser: async () => {
    try {
      set({ loading: true });
      const adminData = await AsyncStorage.getItem('adminUser');
      const sessionTimestamp = await AsyncStorage.getItem('adminSessionTimestamp');
      
      if (adminData && sessionTimestamp) {
        const admin = JSON.parse(adminData);
        const timestamp = parseInt(sessionTimestamp);
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 horas em millisegundos
        
        // Verificar se a sessão ainda é válida (menos de 24 horas)
        if (currentTime - timestamp < sessionDuration) {
          set({ adminUser: admin, isAdminAuthenticated: true, loading: false });
        } else {
          // Sessão expirada, limpar dados
          await AsyncStorage.removeItem('adminUser');
          await AsyncStorage.removeItem('adminSessionTimestamp');
          set({ adminUser: null, isAdminAuthenticated: false, loading: false });
        }
      } else {
        set({ adminUser: null, isAdminAuthenticated: false, loading: false });
      }
    } catch (error) {
      console.error('Error loading admin user:', error);
      set({ adminUser: null, isAdminAuthenticated: false, loading: false });
    }
  },
}));
