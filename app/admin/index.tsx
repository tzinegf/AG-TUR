import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAdminStore } from '../../store/adminStore';
import { View, ActivityIndicator } from 'react-native';

export default function AdminIndex() {
  const { isAdminAuthenticated, loading, loadAdminUser } = useAdminStore();

  useEffect(() => {
    loadAdminUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (isAdminAuthenticated) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/admin/login');
      }
    }
  }, [isAdminAuthenticated, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#DC2626' }}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}