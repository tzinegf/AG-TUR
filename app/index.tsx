import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('Index useEffect - user:', user, 'loading:', loading);
    
    const timer = setTimeout(() => {
      console.log('Timer executed - user:', user, 'loading:', loading);
      if (!loading) {
        if (user) {
          console.log('Redirecting to /(tabs)');
          router.replace('/(tabs)');
        } else {
          console.log('Redirecting to /auth');
          router.replace('/auth');
        }
      }
    }, 100); // Small delay to ensure everything is ready

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#DC2626" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
