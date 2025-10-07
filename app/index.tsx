import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  // Enquanto carrega estado de autenticação, evita flicker
  if (loading) return <View />;

  // Sem usuário → ir para /auth
  if (!user) return <Redirect href="/auth/" />;

  // Autenticado → ir para a área de tabs
  return <Redirect href="/(tabs)" />;
}
