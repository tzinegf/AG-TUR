const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase via variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || 'https://flxqngznhmdrvzoqdjtw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY não definida. Defina-a no ambiente ou em supabase/functions/.env.');
  process.exit(1);
}

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