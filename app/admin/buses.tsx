import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

interface Bus {
  id: string;
  plate: string;
  model: string;
  manufacturer: string;
  year: number;
  seats: number;
  type: 'convencional' | 'executivo' | 'leito';
  status: 'active' | 'maintenance' | 'inactive';
  amenities: string[];
  lastMaintenance: string;
  nextMaintenance: string;
  mileage: number;
  driver?: string;
  imageUrl?: string;
}

export default function AdminBuses() {
  const [buses, setBuses] = useState<Bus[]>([
    {
      id: '1',
      plate: 'ABC-1234',
      model: 'Paradiso 1200',
      manufacturer: 'Marcopolo',
      year: 2022,
      seats: 46,
      type: 'executivo',
      status: 'active',
      amenities: ['ar-condicionado', 'wifi', 'banheiro', 'tomadas'],
      lastMaintenance: '2024-01-01',
      nextMaintenance: '2024-02-01',
      mileage: 45000,
      driver: 'Carlos Silva',
      imageUrl: 'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: '2',
      plate: 'DEF-5678',
      model: 'Busscar Vissta',
      manufacturer: 'Busscar',
      year: 2021,
      seats: 42,
      type: 'convencional',
      status: 'maintenance',
      amenities: ['ar-condicionado', 'banheiro'],
      lastMaintenance: '2023-12-15',
      nextMaintenance: '2024-01-15',
      mileage: 78000,
      driver: 'João Santos',
      imageUrl: 'https://images.pexels.com/photos/68629/pexels-photo-68629.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: '3',
      plate: 'GHI-9012',
      model: 'Comil Campione',
      manufacturer: 'Comil',
      year: 2023,
      seats: 28,
      type: 'leito',
      status: 'active',
      amenities: ['ar-condicionado', 'wifi', 'banheiro', 'tomadas', 'entretenimento', 'serviço-bordo'],
      lastMaintenance: '2023-12-20',
      nextMaintenance: '2024-01-20',
      mileage: 12000,
      driver: 'Pedro Oliveira',
      imageUrl: 'https://images.pexels.com/photos/1210622/pexels-photo-1210622.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'convencional' | 'executivo' | 'leito'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all');

  // Form states
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    manufacturer: '',
    year: new Date().getFullYear(),
    seats: 42,
    type: '' as '' | 'convencional' | 'executivo' | 'leito',
    status: '' as '' | 'active' | 'maintenance' | 'inactive',
    amenities: [] as string[],
    lastMaintenance: '',
    nextMaintenance: '',
    mileage: 0,
    driver: '',
  });

  const availableAmenities = [
    { id: 'ar-condicionado', label: 'Ar Condicionado', icon: 'snow' },
    { id: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
    { id: 'banheiro', label: 'Banheiro', icon: 'water' },
    { id: 'tomadas', label: 'Tomadas USB', icon: 'battery-charging' },
    { id: 'entretenimento', label: 'Entretenimento', icon: 'tv' },
    { id: 'serviço-bordo', label: 'Serviço de Bordo', icon: 'restaurant' },
  ];

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = 
      bus.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bus.driver && bus.driver.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || bus.type === filterType;
    const matchesStatus = filterStatus === 'all' || bus.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddBus = () => {
    setEditingBus(null);
    setFormData({
      plate: '',
      model: '',
      manufacturer: '',
      year: new Date().getFullYear(),
      seats: 42,
      type: 'convencional',
      status: 'active',
      amenities: [],
      lastMaintenance: '',
      nextMaintenance: '',
      mileage: 0,
      driver: '',
    });
    setModalVisible(true);
  };

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus);
    setFormData({
      plate: bus.plate,
      model: bus.model,
      manufacturer: bus.manufacturer,
      year: bus.year,
      seats: bus.seats,
      type: bus.type,
      status: bus.status,
      amenities: bus.amenities,
      lastMaintenance: bus.lastMaintenance,
      nextMaintenance: bus.nextMaintenance,
      mileage: bus.mileage,
      driver: bus.driver || '',
    });
    setModalVisible(true);
  };

  const handleDeleteBus = (busId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este ônibus?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setBuses(buses.filter(bus => bus.id !== busId));
            Alert.alert('Sucesso', 'Ônibus excluído com sucesso!');
          },
        },
      ]
    );
  };

  const handleSaveBus = () => {
    if (!formData.plate || !formData.model || !formData.manufacturer) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingBus) {
      setBuses(buses.map(bus =>
        bus.id === editingBus.id
          ? { ...bus, ...formData }
          : bus
      ));
      Alert.alert('Sucesso', 'Ônibus atualizado com sucesso!');
    } else {
      const newBus: Bus = {
        id: Date.now().toString(),
        ...formData,
        imageUrl: 'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg?auto=compress&cs=tinysrgb&w=600',
      };
      setBuses([...buses, newBus]);
      Alert.alert('Sucesso', 'Ônibus cadastrado com sucesso!');
    }

    setModalVisible(false);
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenityId)
        ? formData.amenities.filter(a => a !== amenityId)
        : [...formData.amenities, amenityId],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'maintenance': return '#F59E0B';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'convencional': return 'Convencional';
      case 'executivo': return 'Executivo';
      case 'leito': return 'Leito';
      default: return type;
    }
  };

  const renderBusItem = ({ item }: { item: Bus }) => (
    <TouchableOpacity style={styles.busCard} onPress={() => handleEditBus(item)}>
      <View style={styles.busHeader}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.busImage} />
        )}
        <View style={styles.busInfo}>
          <View style={styles.busTopRow}>
            <Text style={styles.busPlate}>{item.plate}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>
                {item.status === 'active' ? 'Ativo' : item.status === 'maintenance' ? 'Manutenção' : 'Inativo'}
              </Text>
            </View>
          </View>
          <Text style={styles.busModel}>{item.model}</Text>
          <Text style={styles.busDetails}>{item.manufacturer} • {item.year}</Text>
          
          <View style={styles.busStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color="#6B7280" />
              <Text style={styles.statText}>{item.seats} lugares</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="speedometer" size={16} color="#6B7280" />
              <Text style={styles.statText}>{item.mileage.toLocaleString()} km</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#6B7280" />
              <Text style={styles.statText}>{getTypeLabel(item.type)}</Text>
            </View>
          </View>

          {item.amenities.length > 0 && (
            <View style={styles.amenitiesRow}>
              {item.amenities.slice(0, 3).map((amenity, index) => {
                const amenityData = availableAmenities.find(a => a.id === amenity);
                return amenityData ? (
                  <View key={index} style={styles.amenityBadge}>
                    <Ionicons name={amenityData.icon as any} size={12} color="#DC2626" />
                    <Text style={styles.amenityText}>{amenityData.label}</Text>
                  </View>
                ) : null;
              })}
              {item.amenities.length > 3 && (
                <Text style={styles.moreAmenities}>+{item.amenities.length - 3}</Text>
              )}
            </View>
          )}

          {item.driver && (
            <View style={styles.driverInfo}>
              <Ionicons name="person" size={14} color="#6B7280" />
              <Text style={styles.driverText}>Motorista: {item.driver}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.busActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditBus(item)}
        >
          <Ionicons name="pencil" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteBus(item.id)}
        >
          <Ionicons name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#DC2626', '#B91C1C']} style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciar Ônibus</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBus}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Novo Ônibus</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por placa, modelo ou motorista..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Tipo:</Text>
            <View style={styles.filterPickerContainer}>
              <Picker
                selectedValue={filterType}
                onValueChange={setFilterType}
                style={styles.filterPicker}
              >
                <Picker.Item label="Todos" value="all" color="#1F2937" />
                <Picker.Item label="Convencional" value="convencional" color="#1F2937" />
                <Picker.Item label="Executivo" value="executivo" color="#1F2937" />
                <Picker.Item label="Leito" value="leito" color="#1F2937" />
              </Picker>
            </View>
          </View>
          
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterPickerContainer}>
              <Picker
                selectedValue={filterStatus}
                onValueChange={setFilterStatus}
                style={styles.filterPicker}
              >
                <Picker.Item label="Todos" value="all" color="#1F2937" />
                <Picker.Item label="Ativo" value="active" color="#1F2937" />
                <Picker.Item label="Manutenção" value="maintenance" color="#1F2937" />
                <Picker.Item label="Inativo" value="inactive" color="#1F2937" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Bus List */}
      <FlatList
        data={filteredBuses}
        renderItem={renderBusItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bus-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhum ônibus encontrado</Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBus ? 'Editar Ônibus' : 'Cadastrar Novo Ônibus'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Informações Básicas</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Placa *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.plate}
                    onChangeText={(text) => setFormData({ ...formData, plate: text.toUpperCase() })}
                    placeholder="ABC-1234"
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Modelo *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.model}
                    onChangeText={(text) => setFormData({ ...formData, model: text })}
                    placeholder="Ex: Paradiso 1200"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Fabricante *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.manufacturer}
                    onChangeText={(text) => setFormData({ ...formData, manufacturer: text })}
                    placeholder="Ex: Marcopolo"
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Ano</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.year.toString()}
                      onChangeText={(text) => setFormData({ ...formData, year: parseInt(text) || 0 })}
                      keyboardType="numeric"
                      placeholder="2024"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.label}>Assentos</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.seats.toString()}
                      onChangeText={(text) => setFormData({ ...formData, seats: parseInt(text) || 0 })}
                      keyboardType="numeric"
                      placeholder="42"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tipo</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      style={styles.formPicker}
                    >
                      <Picker.Item label="Selecione o tipo..." value="" color="#9CA3AF" />
                      <Picker.Item label="Convencional" value="convencional" color="#1F2937" />
                      <Picker.Item label="Executivo" value="executivo" color="#1F2937" />
                      <Picker.Item label="Leito" value="leito" color="#1F2937" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                      style={styles.formPicker}
                    >
                      <Picker.Item label="Selecione o status..." value="" color="#9CA3AF" />
                      <Picker.Item label="Ativo" value="active" color="#1F2937" />
                      <Picker.Item label="Em Manutenção" value="maintenance" color="#1F2937" />
                      <Picker.Item label="Inativo" value="inactive" color="#1F2937" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Comodidades</Text>
                <View style={styles.amenitiesGrid}>
                  {availableAmenities.map((amenity) => (
                    <TouchableOpacity
                      key={amenity.id}
                      style={[
                        styles.amenityOption,
                        formData.amenities.includes(amenity.id) && styles.amenitySelected,
                      ]}
                      onPress={() => toggleAmenity(amenity.id)}
                    >
                      <Ionicons
                        name={amenity.icon as any}
                        size={20}
                        color={formData.amenities.includes(amenity.id) ? '#DC2626' : '#6B7280'}
                      />
                      <Text
                        style={[
                          styles.amenityOptionText,
                          formData.amenities.includes(amenity.id) && styles.amenitySelectedText,
                        ]}
                      >
                        {amenity.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Manutenção e Operação</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Quilometragem</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.mileage.toString()}
                    onChangeText={(text) => setFormData({ ...formData, mileage: parseInt(text) || 0 })}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Última Manutenção</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastMaintenance}
                    onChangeText={(text) => setFormData({ ...formData, lastMaintenance: text })}
                    placeholder="DD/MM/AAAA"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Próxima Manutenção</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.nextMaintenance}
                    onChangeText={(text) => setFormData({ ...formData, nextMaintenance: text })}
                    placeholder="DD/MM/AAAA"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Motorista Responsável</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.driver}
                    onChangeText={(text) => setFormData({ ...formData, driver: text })}
                    placeholder="Nome do motorista"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveBus}>
                <Text style={styles.saveButtonText}>
                  {editingBus ? 'Salvar Alterações' : 'Cadastrar Ônibus'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filtersRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  filterItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 40,
  },
  filterPickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    minHeight: 50,
  },
  filterPicker: {
    height: 50,
    color: '#1F2937',
  },
  listContainer: {
    padding: 20,
  },
  busCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  busHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  busImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  busInfo: {
    flex: 1,
  },
  busTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  busPlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  busModel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 2,
  },
  busDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  busStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  amenityText: {
    fontSize: 11,
    color: '#DC2626',
  },
  moreAmenities: {
    fontSize: 11,
    color: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  driverText: {
    fontSize: 12,
    color: '#6B7280',
  },
  busActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 56,
  },
  formPicker: {
    height: 56,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    gap: 8,
  },
  amenitySelected: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  amenityOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  amenitySelectedText: {
    color: '#DC2626',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
