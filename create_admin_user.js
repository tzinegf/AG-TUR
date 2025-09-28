const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://flxqngznhmdrvzoqdjtw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseHFuZ3puaG1kcnZ6b3FkanR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk4MTg4NCwiZXhwIjoyMDczNTU3ODg0fQ.YOUR_SERVICE_ROLE_KEY_HERE'; // Substitua pela sua service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('Criando usuário admin...');
    
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@agtur.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador AG TUR',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário:', authError.message);
      return;
    }

    console.log('Usuário criado com sucesso:', authData.user.id);

    // Criar perfil de admin na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'admin@agtur.com',
        name: 'Administrador AG TUR',
        phone: '',
        role: 'admin'
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError.message);
      return;
    }

    console.log('Perfil admin criado com sucesso!');
    console.log('Email: admin@agtur.com');
    console.log('Senha: admin123456');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a função
createAdminUser();