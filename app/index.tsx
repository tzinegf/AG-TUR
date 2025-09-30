import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState('Página inicial carregada');

  useEffect(() => {
    console.log('Index component loaded successfully');
    setDebugInfo('Componente Index carregado com sucesso');
  }, []);

  const handleAuthNavigation = () => {
    console.log('Manual navigation to /auth');
    setDebugInfo('Navegando para /auth...');
    try {
      router.push('/auth');
    } catch (error) {
      console.error('Navigation error:', error);
      setDebugInfo('Erro na navegação para /auth');
    }
  };

  const handleTabsNavigation = () => {
    console.log('Manual navigation to /(tabs)');
    setDebugInfo('Navegando para /(tabs)...');
    try {
      router.push('/(tabs)');
    } catch (error) {
      console.error('Navigation error:', error);
      setDebugInfo('Erro na navegação para /(tabs)');
    }
  };

  const handleAdminNavigation = () => {
    console.log('Manual navigation to /admin');
    setDebugInfo('Navegando para /admin...');
    try {
      router.push('/admin');
    } catch (error) {
      console.error('Navigation error:', error);
      setDebugInfo('Erro na navegação para /admin');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AG Tur - Página Inicial</Text>
      <Text style={styles.debugText}>{debugInfo}</Text>
      
      <Pressable 
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]} 
        onPress={handleAuthNavigation}
      >
        <Text style={styles.buttonText}>Ir para Autenticação</Text>
      </Pressable>
      
      <Pressable 
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]} 
        onPress={handleTabsNavigation}
      >
        <Text style={styles.buttonText}>Ir para Tabs</Text>
      </Pressable>

      <Pressable 
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]} 
        onPress={handleAdminNavigation}
      >
        <Text style={styles.buttonText}>Ir para Admin</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  debugText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
    userSelect: Platform.OS === 'web' ? 'none' : 'auto',
  },
  buttonPressed: {
    backgroundColor: '#B91C1C',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
