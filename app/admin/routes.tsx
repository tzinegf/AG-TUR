import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { busRoutesService } from '../../services/busRoutes';
import { BusRoute, supabase } from '../../lib/supabase';

interface RouteDisplay {
  id: string;
  origin: string;
  destination: string;
  duration: string;
  distance: string;
  price: string;
  active: boolean;
  departure: string;
  arrival: string;
  bus_type: string;
  bus_company: string;
}

export default function RoutesManagement() {
  const [routes, setRoutes] = useState<RouteDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteDisplay | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departure: '',
    arrival_time: '',
    price: '',
    bus_company: '',
    bus_type: 'convencional'
  });

  // Fetch routes on component mount
  useEffect(() => {
    fetchRoutes();
  }, []);

  // Fetch all routes from API
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new getAllRoutes function from busRoutesService
      const routesData = await busRoutesService.getAllRoutes();
      
      if (routesData) {
        const formattedRoutes = routesData.map(route => ({
          id: route.id,
          origin: route.origin,
          destination: route.destination,
          departure: route.departure,
          arrival: route.arrival,
          duration: route.duration ? `${route.duration}h` : 'N/A',
          distance: '~', // This would need to be calculated or stored
          price: `R$ ${route.price.toFixed(2)}`,
          active: true, // Assuming all routes are active since there's no status field
          bus_company: route.bus_company,
          bus_type: route.bus_type || 'Convencional'
        }));
        setRoutes(formattedRoutes);
      }
    } catch (err) {
      setError('Falha ao carregar rotas');
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate duration between departure and arrival
  const calculateDuration = (departure: string, arrival: string) => {
    const departureDate = new Date(departure);
    const arrivalDate = new Date(arrival);
    const diffInMinutes = Math.floor((arrivalDate.getTime() - departureDate.getTime()) / 60000);
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes > 0 ? minutes + 'min' : ''}`;
  };
  // Form handlers
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    if (!isModalVisible) {
      // Reset form when opening modal
      setFormData({
        origin: '',
        destination: '',
        departure: '',
        arrival_time: '',
        price: '',
        bus_company: '',
        bus_type: 'convencional'
      });
      setEditingRoute(null);
    }
  };



  const handleAddRoute = async () => {
    try {
      // Validação de campos obrigatórios
      if (!formData.origin?.trim()) {
        Alert.alert('Erro de Validação', 'Por favor, informe a cidade de origem');
        return;
      }

      if (!formData.destination?.trim()) {
        Alert.alert('Erro de Validação', 'Por favor, informe a cidade de destino');
        return;
      }

      if (!formData.departure?.trim()) {
        Alert.alert('Erro de Validação', 'Por favor, informe o horário de partida');
        return;
      }

      if (!formData.arrival_time?.trim()) {
        Alert.alert('Erro de Validação', 'Por favor, informe o horário de chegada');
        return;
      }

      if (!formData.price?.trim()) {
        Alert.alert('Erro de Validação', 'Por favor, informe o preço da passagem');
        return;
      }

      if (!formData.bus_company?.trim()) {
        Alert.alert('Erro de Validação', 'Por favor, informe a empresa do ônibus');
        return;
      }

      // Validação de nomes de cidades brasileiras
      const cityNameRegex = /^[A-Za-zÀ-ÿ\s\-'\.]+$/;
      
      if (!cityNameRegex.test(formData.origin.trim())) {
        Alert.alert('Erro de Validação', 'Nome da cidade de origem inválido. Use apenas letras, espaços, hífens e acentos');
        return;
      }

      if (!cityNameRegex.test(formData.destination.trim())) {
        Alert.alert('Erro de Validação', 'Nome da cidade de destino inválido. Use apenas letras, espaços, hífens e acentos');
        return;
      }

      // Validação de tamanho dos nomes das cidades
      if (formData.origin.trim().length < 2 || formData.origin.trim().length > 50) {
        Alert.alert('Erro de Validação', 'O nome da cidade de origem deve ter entre 2 e 50 caracteres');
        return;
      }

      if (formData.destination.trim().length < 2 || formData.destination.trim().length > 50) {
        Alert.alert('Erro de Validação', 'O nome da cidade de destino deve ter entre 2 e 50 caracteres');
        return;
      }

      // Validação de origem e destino diferentes
      if (formData.origin.trim().toLowerCase() === formData.destination.trim().toLowerCase()) {
        Alert.alert('Erro de Validação', 'A cidade de origem deve ser diferente da cidade de destino');
        return;
      }

      // Validação de horários no formato brasileiro (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (!timeRegex.test(formData.departure.trim())) {
        Alert.alert('Erro de Validação', 'Horário de partida inválido. Use o formato HH:MM (ex: 08:30)');
        return;
      }

      if (!timeRegex.test(formData.arrival_time.trim())) {
        Alert.alert('Erro de Validação', 'Horário de chegada inválido. Use o formato HH:MM (ex: 14:45)');
        return;
      }

      const departure = new Date(`2024-01-01T${formData.departure}`);
      const arrivalTime = new Date(`2024-01-01T${formData.arrival_time}`);

      if (arrivalTime <= departure) {
        Alert.alert('Erro de Validação', 'O horário de chegada deve ser posterior ao horário de partida');
        return;
      }

      // Validação de duração da viagem (máximo 24 horas)
      const durationInHours = (arrivalTime.getTime() - departure.getTime()) / (1000 * 60 * 60);
      if (durationInHours > 24) {
        Alert.alert('Erro de Validação', 'A duração da viagem não pode exceder 24 horas');
        return;
      }

      // Validação de preço no formato brasileiro
      const priceRegex = /^R?\$?\s?(\d{1,4}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)$/;
      
      if (!priceRegex.test(formData.price.trim())) {
        Alert.alert('Erro de Validação', 'Formato de preço inválido. Use o formato brasileiro (ex: R$ 45,50 ou 45,50)');
        return;
      }

      // Conversão do preço brasileiro para número
      let priceValue = formData.price.replace('R$', '').replace(/\s/g, '').trim();
      
      // Se tem ponto como separador de milhares, remove
      if (priceValue.includes('.') && priceValue.includes(',')) {
        priceValue = priceValue.replace(/\./g, '');
      }
      
      // Converte vírgula para ponto decimal
      priceValue = priceValue.replace(',', '.');
      const finalPrice = parseFloat(priceValue);
      
      if (isNaN(finalPrice) || finalPrice <= 0) {
        Alert.alert('Erro de Validação', 'Por favor, insira um preço válido maior que zero');
        return;
      }

      if (finalPrice < 5.00) {
        Alert.alert('Erro de Validação', 'O preço mínimo da passagem é R$ 5,00');
        return;
      }

      if (finalPrice > 999.99) {
        Alert.alert('Erro de Validação', 'O preço máximo da passagem é R$ 999,99');
        return;
      }

      // Validação de nome da empresa brasileira
      const companyNameRegex = /^[A-Za-zÀ-ÿ0-9\s\-\.\&]+$/;
      
      if (!companyNameRegex.test(formData.bus_company.trim())) {
        Alert.alert('Erro de Validação', 'Nome da empresa inválido. Use apenas letras, números, espaços, hífens, pontos e &');
        return;
      }

      if (formData.bus_company.trim().length < 3) {
        Alert.alert('Erro de Validação', 'O nome da empresa deve ter pelo menos 3 caracteres');
        return;
      }

      if (formData.bus_company.trim().length > 60) {
        Alert.alert('Erro de Validação', 'O nome da empresa não pode ter mais de 60 caracteres');
        return;
      }

      // Validação adicional: não permitir palavras inadequadas
      const forbiddenWords = ['teste', 'test', 'exemplo', 'sample'];
      const companyLower = formData.bus_company.trim().toLowerCase();
      
      if (forbiddenWords.some(word => companyLower.includes(word))) {
        Alert.alert('Erro de Validação', 'Por favor, informe o nome real da empresa de ônibus');
        return;
      }

      const newRoute = {
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        departure: formData.departure.trim(),
        arrival: formData.arrival_time.trim(),
        arrival_time: formData.arrival_time.trim(),
        price: finalPrice,
        bus_company: formData.bus_company.trim(),
        bus_type: formData.bus_type,
        available_seats: 40,
        total_seats: 40,
        duration: calculateDuration(formData.departure.trim(), formData.arrival_time.trim()),
        status: 'active'
      };

      if (editingRoute) {
        // Update existing route
        await busRoutesService.updateRoute(editingRoute.id, newRoute);
        Alert.alert('Sucesso', 'Rota atualizada com sucesso');
      } else {
        // Create new route
        await busRoutesService.createRoute(newRoute);
        Alert.alert('Sucesso', 'Rota cadastrada com sucesso');
      }

      // Refresh routes list
      await fetchRoutes();
      toggleModal();
    } catch (err) {
      console.error('Error saving route:', err);
      Alert.alert('Erro', `Falha ao ${editingRoute ? 'atualizar' : 'cadastrar'} rota`);
    }
  };

  const handleEditRoute = (route: RouteDisplay) => {
    setEditingRoute(route);
    // Format price to remove currency symbol
    const priceValue = route.price.replace('R$ ', '').replace(',', '.');
    
    setFormData({
      origin: route.origin,
      destination: route.destination,
      departure: route.departure,
      arrival_time: route.arrival,
      price: priceValue,
      bus_company: route.bus_company,
      bus_type: route.bus_type || 'convencional'
    });
    setModalVisible(true);
  };

  const toggleRouteStatus = async (routeId: string, currentStatus: boolean) => {
    try {
      await busRoutesService.updateRoute(routeId, {
        status: currentStatus ? 'cancelled' : 'active'
      });
      await fetchRoutes();
      Alert.alert('Sucesso', 'Status da rota atualizado com sucesso');
    } catch (err) {
      console.error('Error updating route status:', err);
      Alert.alert('Erro', 'Falha ao atualizar status da rota');
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta rota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await busRoutesService.deleteRoute(routeId);
              await fetchRoutes();
              Alert.alert('Sucesso', 'Rota excluída com sucesso');
            } catch (err) {
              console.error('Error deleting route:', err);
              Alert.alert('Erro', 'Falha ao excluir rota');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Nova Rota</Text>
        </TouchableOpacity>
      </View>

      {/* Routes List */}
      <ScrollView style={styles.routesList}>
        {loading ? (
          <ActivityIndicator size="large" color="#DC2626" style={{marginTop: 20}} />
        ) : error ? (
          <View style={{alignItems: 'center', marginTop: 20}}>
            <Text style={{color: '#EF4444', marginBottom: 10}}>{error}</Text>
            <TouchableOpacity onPress={fetchRoutes}>
              <Text style={{color: '#3B82F6'}}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : routes.length === 0 ? (
          <Text style={{textAlign: 'center', marginTop: 20, color: '#6B7280'}}>
            Nenhuma rota encontrada. Adicione uma nova rota para começar.
          </Text>
        ) : (
          routes.map((route) => (
            <View key={route.id} style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeTitle}>
                    {route.origin} → {route.destination}
                  </Text>
                  <View style={styles.routeDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{route.duration}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="bus" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{route.bus_type}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{route.price}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.statusBadge, route.active ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={styles.statusText}>{route.active ? 'Ativa' : 'Inativa'}</Text>
                </View>
              </View>

              <View style={styles.routeActions}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => toggleRouteStatus(route.id, route.active)}
                >
                  <Ionicons 
                    name={route.active ? "pause-circle" : "play-circle"} 
                    size={20} 
                    color={route.active ? "#F59E0B" : "#10B981"} 
                  />
                  <Text style={styles.actionText}>
                    {route.active ? 'Desativar' : 'Ativar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditRoute(route)}
                >
                  <Ionicons name="create" size={20} color="#3B82F6" />
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteRoute(route.id)}
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                  <Text style={styles.actionText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Route Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingRoute ? 'Editar Rota' : 'Nova Rota'}
          </Text>

          <ScrollView 
            style={styles.formScrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Origem *</Text>
              <TextInput
                style={styles.input}
                value={formData.origin}
                onChangeText={(text) => handleInputChange('origin', text)}
                placeholder="Ex: São Paulo"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Destino *</Text>
              <TextInput
                style={styles.input}
                value={formData.destination}
                onChangeText={(text) => handleInputChange('destination', text)}
                placeholder="Ex: Rio de Janeiro"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Data/Hora de Partida *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.departure}
                  onChangeText={(text) => handleInputChange('departure', text)}
                  placeholder="AAAA-MM-DD HH:MM:SS"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Data/Hora de Chegada *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.arrival_time}
                  onChangeText={(text) => handleInputChange('arrival_time', text)}
                  placeholder="AAAA-MM-DD HH:MM:SS"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Preço *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
                placeholder="Ex: 85.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Empresa *</Text>
              <TextInput
                style={styles.input}
                value={formData.bus_company}
                onChangeText={(text) => handleInputChange('bus_company', text)}
                placeholder="Nome da empresa"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de Ônibus *</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity 
                  style={[styles.pickerOption, formData.bus_type === 'convencional' && styles.pickerOptionSelected]}
                  onPress={() => handleInputChange('bus_type', 'convencional')}
                >
                  <Text style={[styles.pickerText, formData.bus_type === 'convencional' && styles.pickerTextSelected]}>
                    Convencional
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerOption, formData.bus_type === 'executivo' && styles.pickerOptionSelected]}
                  onPress={() => handleInputChange('bus_type', 'executivo')}
                >
                  <Text style={[styles.pickerText, formData.bus_type === 'executivo' && styles.pickerTextSelected]}>
                    Executivo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerOption, formData.bus_type === 'semi-leito' && styles.pickerOptionSelected]}
                  onPress={() => handleInputChange('bus_type', 'semi-leito')}
                >
                  <Text style={[styles.pickerText, formData.bus_type === 'semi-leito' && styles.pickerTextSelected]}>
                    Semi-Leito
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerOption, formData.bus_type === 'leito' && styles.pickerOptionSelected]}
                  onPress={() => handleInputChange('bus_type', 'leito')}
                >
                  <Text style={[styles.pickerText, formData.bus_type === 'leito' && styles.pickerTextSelected]}>
                    Leito
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={toggleModal}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleAddRoute}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Estilos para os novos campos
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  pickerOptionSelected: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  pickerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  pickerTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  amenityChipSelected: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  amenityText: {
    fontSize: 12,
    color: '#6B7280',
  },
  amenityTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  routesList: {
    flex: 1,
    padding: 20,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  routeInfo: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  routeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  formScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#DC2626',
  },
  
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noRoutesText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6B7280',
  },
});
