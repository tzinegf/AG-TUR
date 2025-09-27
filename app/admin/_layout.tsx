import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAdminStore } from '../../store/adminStore';
import { ActivityIndicator, View } from 'react-native';

export default function AdminLayout() {
  const { isAdminAuthenticated, loading, loadAdminUser } = useAdminStore();

  useEffect(() => {
    loadAdminUser();
  }, []);

  useEffect(() => {
    if (!loading && !isAdminAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAdminAuthenticated, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#DC2626' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#DC2626',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: 'Painel Administrativo' }} />
      <Stack.Screen name="routes" options={{ title: 'Gerenciar Rotas' }} />
      <Stack.Screen name="buses" options={{ title: 'Gerenciar Ônibus' }} />
      <Stack.Screen name="bookings" options={{ title: 'Gerenciar Reservas' }} />
      <Stack.Screen name="users" options={{ title: 'Gerenciar Usuários' }} />
      <Stack.Screen name="reports" options={{ title: 'Relatórios' }} />
    </Stack>
  );
}
