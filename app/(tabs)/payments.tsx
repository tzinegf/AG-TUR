import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Linking } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { stripeService, PaymentMethod } from '../../services/stripe';

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const hasBackend = !!process.env.EXPO_PUBLIC_API_BASE_URL || !!process.env.EXPO_PUBLIC_BACKEND_URL;
  const paymentLink = process.env.EXPO_PUBLIC_STRIPE_PAYMENT_LINK_URL;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await stripeService.getOrCreateCustomer();
      const list = await stripeService.listPaymentMethods();
      setMethods(list);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Erro ao carregar métodos', err.message || 'Verifique configuração do backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasBackend) {
      load();
    }
  }, [load, hasBackend]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleAddCard = async () => {
    try {
      if (!hasBackend) {
        Alert.alert('Configuração necessária', 'Para adicionar cartão, é preciso configurar o backend do Stripe.');
        return;
      }
      const res = await stripeService.createSetupIntent();
      if (res.redirectUrl) {
        Linking.openURL(res.redirectUrl);
        return;
      }
      Alert.alert('Setup', 'ClientSecret obtido. Complete a confirmação na UI nativa.');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Erro ao iniciar Setup', err.message || 'Tente novamente');
    }
  };

  const handleOpenCheckout = () => {
    if (!paymentLink) {
      Alert.alert('URL não configurada', 'Defina EXPO_PUBLIC_STRIPE_PAYMENT_LINK_URL no .env com um Payment Link do Stripe.');
      return;
    }
    Linking.openURL(paymentLink);
  };

  const handleDetach = async (pmId: string) => {
    try {
      await stripeService.detachPaymentMethod(pmId);
      Alert.alert('Pronto', 'Método removido');
      load();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Erro ao remover', err.message || 'Tente novamente');
    }
  };

  const renderItem = ({ item }: { item: PaymentMethod }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.brand}>{item.brand?.toUpperCase() || 'Card'}</Text>
        <Text style={styles.last4}>•••• {item.last4}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.exp}>Exp: {item.exp_month}/{item.exp_year}</Text>
        <TouchableOpacity style={styles.detach} onPress={() => handleDetach(item.id)}>
          <Text style={styles.detachText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meios de Pagamento</Text>
      <Text style={styles.subtitle}>Gerencie seus cartões salvos.</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
        <Text style={styles.addButtonText}>Adicionar Cartão</Text>
      </TouchableOpacity>

      {!hasBackend && (
        <TouchableOpacity style={[styles.addButton, { backgroundColor: '#111827' }]} onPress={handleOpenCheckout}>
          <Text style={styles.addButtonText}>Pagar via Stripe Checkout</Text>
        </TouchableOpacity>
      )}

      {hasBackend && loading ? (
        <ActivityIndicator size="large" color="#DC2626" />
      ) : hasBackend ? (
        <FlatList
          data={methods}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={methods.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum método salvo</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Para gerenciar cartões e salvar métodos, é necessário configurar o backend com Stripe.
          </Text>
          <Text style={styles.infoText}>
            Enquanto isso, você pode usar um Payment Link do Stripe para cobrar via Checkout.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  addButton: { backgroundColor: '#DC2626', padding: 12, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 16, fontWeight: '600', color: '#111827' },
  last4: { fontSize: 16, color: '#374151' },
  exp: { fontSize: 12, color: '#6B7280' },
  detach: { padding: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  detachText: { color: '#111827', fontWeight: '600' },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#6B7280' },
  infoBox: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginTop: 12 },
  infoText: { color: '#374151', marginBottom: 6 },
});