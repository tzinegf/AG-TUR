import { supabase } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}

export const adminAuthService = {
  async signInAdmin(email: string, password: string): Promise<{ user: AdminUser | null; error: string | null }> {
    try {
      // Autenticar com Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Falha na autenticação' };
      }

      // Verificar se o usuário tem perfil de admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .eq('role', 'admin')
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        return { user: null, error: 'Acesso negado. Usuário não é administrador.' };
      }

      const adminUser: AdminUser = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role as 'admin' | 'manager'
      };

      return { user: adminUser, error: null };
    } catch (error) {
      console.error('Erro na autenticação admin:', error);
      return { user: null, error: 'Erro interno do servidor' };
    }
  },

  async signOutAdmin(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentAdminUser(): Promise<AdminUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'admin')
        .single();

      if (error || !profile) return null;

      return {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role as 'admin' | 'manager'
      };
    } catch (error) {
      console.error('Erro ao obter usuário admin atual:', error);
      return null;
    }
  },

  async createAdminUser(email: string, password: string, fullName: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
            role: 'admin'
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Falha ao criar usuário' };
      }

      // Criar perfil de admin
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          name: fullName,
          phone: '',
          role: 'admin'
        });

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao criar usuário admin:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }
};