import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useAdminStore } from '../../store/adminStore';

export default function DashboardTab() {
  const { loadAdminUser } = useAdminStore();

  useEffect(() => {
    const go = async () => {
      try {
        await loadAdminUser();
      } catch {}
      const { isAdminAuthenticated } = useAdminStore.getState();
      router.replace(isAdminAuthenticated ? '/admin/dashboard' : '/admin/login');
    };
    go();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#DC2626" />
      <Text style={{ marginTop: 12, color: '#6B7280' }}>Abrindo Painel Administrativo...</Text>
    </View>
  );
}