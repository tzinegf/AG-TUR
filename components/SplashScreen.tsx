import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AGTurLogo } from './AGTurLogo';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <AGTurLogo width={280} height={140} />
      <Text style={styles.title}>AG TUR</Text>
      <Text style={styles.subtitle}>Sua viagem começa aqui</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginTop: 8,
  },
});

export default SplashScreen;
