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
      // Validação básica de entrada
      if (!email || !password || email.trim() === '' || password.trim() === '') {
        console.error('Erro de validação: Email ou senha não fornecidos');
        set({ loading: false });
        return false;
      }
      
      // Tentar autenticação no Supabase
      try {
        console.log('Iniciando autenticação para:', email);
        const { user, error } = await adminAuthService.signInAdmin(email, password);
        
        if (error) {
          console.error('Erro de autenticação detalhado:', error);
          // Propagar o erro específico para o componente de UI
          throw new Error(error);
        }

        if (!user) {
          console.error('Usuário não encontrado após autenticação');
          throw new Error('Usuário não encontrado após autenticação bem-sucedida');
        }
        
        console.log('Autenticação bem-sucedida para:', email);

        // Converter o formato do usuário para o formato esperado pelo store
        const adminUser: AdminUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        // Salvar no AsyncStorage com timestamp de expiração (24 horas)
        const sessionTimestamp = Date.now().toString();
        const expirationTime = (Date.now() + 24 * 60 * 60 * 1000).toString(); // 24 horas
        
        // Salvar dados apenas após confirmação de sucesso
        await Promise.all([
          AsyncStorage.setItem('adminUser', JSON.stringify(adminUser)),
          AsyncStorage.setItem('adminSessionTimestamp', sessionTimestamp),
          AsyncStorage.setItem('adminSessionExpiration', expirationTime)
        ]);
        
        set({ 
          adminUser, 
          isAdminAuthenticated: true,
          loading: false 
        });
        
        return true;
      } catch (supabaseError) {
        console.error('Falha na autenticação Supabase:', supabaseError);
        
        // MODO DESENVOLVIMENTO SEGURO: Apenas para desenvolvimento local
        const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
        
        if (isDevelopment && email === 'dev@agtur.local' && password === 'DevSecure2024!') {
          console.warn('⚠️ USANDO CREDENCIAIS DE DESENVOLVIMENTO - NÃO USAR EM PRODUÇÃO');
          
          const adminUser: AdminUser = {
            id: 'dev-admin-001',
            name: 'Administrador Desenvolvimento',
            email: 'dev@agtur.local',
            role: 'admin',
          };

          // Salvar no AsyncStorage com timestamp de expiração curta (2 horas para dev)
          const sessionTimestamp = Date.now().toString();
          const expirationTime = (Date.now() + 2 * 60 * 60 * 1000).toString(); // 2 horas
          
          await Promise.all([
            AsyncStorage.setItem('adminUser', JSON.stringify(adminUser)),
            AsyncStorage.setItem('adminSessionTimestamp', sessionTimestamp),
            AsyncStorage.setItem('adminSessionExpiration', expirationTime)
          ]);
          
          set({ 
            adminUser, 
            isAdminAuthenticated: true,
            loading: false 
          });
          
          return true;
        }
        
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
      
      // Limpar AsyncStorage completamente
      await AsyncStorage.removeItem('adminUser');
      await AsyncStorage.removeItem('adminSessionTimestamp');
      await AsyncStorage.removeItem('adminSessionExpiration');
      
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
      const sessionExpiration = await AsyncStorage.getItem('adminSessionExpiration');
      
      if (adminData && sessionTimestamp && sessionExpiration) {
        const admin = JSON.parse(adminData);
        const expirationTime = parseInt(sessionExpiration);
        const currentTime = Date.now();
        
        // Verificar se a sessão ainda é válida
        if (currentTime < expirationTime) {
          set({ 
            adminUser: admin, 
            isAdminAuthenticated: true, 
            loading: false 
          });
        } else {
          // Sessão expirada - limpar dados
          console.log('Sessão admin expirada, fazendo logout automático');
          await AsyncStorage.removeItem('adminUser');
          await AsyncStorage.removeItem('adminSessionTimestamp');
          await AsyncStorage.removeItem('adminSessionExpiration');
          set({ 
            adminUser: null, 
            isAdminAuthenticated: false, 
            loading: false 
          });
        }
      } else {
        set({ 
          adminUser: null, 
          isAdminAuthenticated: false, 
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error loading admin user:', error);
      set({ 
        adminUser: null, 
        isAdminAuthenticated: false, 
        loading: false 
      });
    }
  },
}));
