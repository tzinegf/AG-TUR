import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminAuthService, AdminUser as AuthAdminUser } from '../services/adminAuth';

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
      
      // MODO DESENVOLVIMENTO: Credenciais temporárias
      if (email === 'admin@agtur.com' && password === 'admin123') {
        const adminUser: AdminUser = {
          id: 'dev-admin-001',
          name: 'Administrador AG TUR',
          email: 'admin@agtur.com',
          role: 'admin',
        };

        // Salvar no AsyncStorage
        const sessionTimestamp = Date.now().toString();
        await AsyncStorage.setItem('adminUser', JSON.stringify(adminUser));
        await AsyncStorage.setItem('adminSessionTimestamp', sessionTimestamp);
        
        set({ 
          adminUser, 
          isAdminAuthenticated: true,
          loading: false 
        });
        
        return true;
      }
      
      // Tentar autenticação real do Supabase como fallback
      try {
        const { user, error } = await adminAuthService.signInAdmin(email, password);
        
        if (error || !user) {
          set({ loading: false });
          return false;
        }

        // Converter o formato do usuário para o formato esperado pelo store
        const adminUser: AdminUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        // Salvar no AsyncStorage
        const sessionTimestamp = Date.now().toString();
        await AsyncStorage.setItem('adminUser', JSON.stringify(adminUser));
        await AsyncStorage.setItem('adminSessionTimestamp', sessionTimestamp);
        
        set({ 
          adminUser, 
          isAdminAuthenticated: true,
          loading: false 
        });
        
        return true;
      } catch (supabaseError) {
        console.log('Supabase auth failed, using dev mode only');
        set({ loading: false });
        return false;
      }
      
    } catch (error) {
      console.error('Erro na autenticação admin:', error);
      set({ loading: false });
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
      
      // Fazer logout no Supabase
      await adminAuthService.signOutAdmin();
      
      // Limpar AsyncStorage
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
