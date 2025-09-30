import React, { useState, useEffect } from 'react';
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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  routeId: string;
  routeName: string;
  busId: string;
  busPlate: string;
  seatNumber: string;
  departureDate: string;
  departureTime: string;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      bookingCode: 'AG2024001',
      userId: '1',
      userName: 'João Silva',
      userEmail: 'joao.silva@email.com',
      routeId: '1',
      routeName: 'São Paulo - Rio de Janeiro',
      busId: '1',
      busPlate: 'ABC-1234',
      seatNumber: '12A',
      departureDate: '2024-01-20',
      departureTime: '08:00',
      price: 120.00,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: '2',
      bookingCode: 'AG2024002',
      userId: '2',
      userName: 'Maria Santos',
      userEmail: 'maria.santos@email.com',
      routeId: '2',
      routeName: 'Belo Horizonte - Brasília',
      busId: '2',
      busPlate: 'DEF-5678',
      seatNumber: '08B',
      departureDate: '2024-01-21',
      departureTime: '14:30',
      price: 180.00,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '2024-01-15T14:45:00',
    },
    {
      id: '3',
      bookingCode: 'AG2024003',
      userId: '3',
      userName: 'Pedro Oliveira',
      userEmail: 'pedro.oliveira@email.com',
      routeId: '3',
      routeName: 'Salvador - Recife',
      busId: '3',
      busPlate: 'GHI-9012',
      seatNumber: '15A',
      departureDate: '2024-01-19',
      departureTime: '22:00',
      price: 95.00,
      status: 'cancelled',
      paymentStatus: 'refunded',
      createdAt: '2024-01-14T16:20:00',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'pending' | 'refunded'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('Usuário acessou a página: Reservas Administrativas');
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.routeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || booking.paymentStatus === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const handleUpdateStatus = (newStatus: 'confirmed' | 'pending' | 'cancelled') => {
    if (!selectedBooking) return;

    Alert.alert(
      'Confirmar Alteração',
      `Deseja alterar o status da reserva para ${getStatusLabel(newStatus)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setBookings(bookings.map(booking =>
              booking.id === selectedBooking.id
                ? { ...booking, status: newStatus }
                : booking
            ));
            setModalVisible(false);
            Alert.alert('Sucesso', 'Status da reserva atualizado!');
          },
        },
      ]
    );
  };

  const handleUpdatePayment = (newPaymentStatus: 'paid' | 'pending' | 'refunded') => {
    if (!selectedBooking) return;

    Alert.alert(
      'Confirmar Alteração',
      `Deseja alterar o status do pagamento para ${getPaymentLabel(newPaymentStatus)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setBookings(bookings.map(booking =>
              booking.id === selectedBooking.id
                ? { ...booking, paymentStatus: newPaymentStatus }
                : booking
            ));
            setModalVisible(false);
            Alert.alert('Sucesso', 'Status do pagamento atualizado!');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPaymentLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity style={styles.bookingCard} onPress={() => handleViewBooking(item)}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingCode}>{item.bookingCode}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.bookingInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.userName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="map" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.routeName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {new Date(item.departureDate).toLocaleDateString('pt-BR')} às {item.departureTime}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="cash" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            R$ {item.price.toFixed(2)} - {getPaymentLabel(item.paymentStatus)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#DC2626', '#B91C1C']} style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciar Reservas</Text>
        <Text style={styles.headerSubtitle}>
          {filteredBookings.length} reserva{filteredBookings.length !== 1 ? 's' : ''} encontrada{filteredBookings.length !== 1 ? 's' : ''}
        </Text>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por código, nome, email ou rota..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterPickerContainer}>
              <Picker
                selectedValue={filterStatus}
                onValueChange={setFilterStatus}
                style={styles.filterPicker}
              >
                <Picker.Item label="Todos" value="all" color="#1F2937" />
                <Picker.Item label="Confirmadas" value="confirmed" color="#1F2937" />
                <Picker.Item label="Pendentes" value="pending" color="#1F2937" />
                <Picker.Item label="Canceladas" value="cancelled" color="#1F2937" />
              </Picker>
            </View>
          </View>
          
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Pagamento:</Text>
            <View style={styles.filterPickerContainer}>
              <Picker
                selectedValue={filterPayment}
                onValueChange={setFilterPayment}
                style={styles.filterPicker}
              >
                <Picker.Item label="Todos" value="all" color="#1F2937" />
                <Picker.Item label="Pago" value="paid" color="#1F2937" />
                <Picker.Item label="Pendente" value="pending" color="#1F2937" />
                <Picker.Item label="Reembolsado" value="refunded" color="#1F2937" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhuma reserva encontrada</Text>
          </View>
        }
      />

      {/* Booking Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Reserva</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Informações da Reserva</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.bookingCode}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBooking.status) }]}>
                      <Text style={styles.statusText}>{getStatusLabel(selectedBooking.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Criada em:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedBooking.createdAt).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Informações do Passageiro</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nome:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.userName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.userEmail}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Informações da Viagem</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rota:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.routeName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ônibus:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.busPlate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Assento:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.seatNumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Data/Hora:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedBooking.departureDate).toLocaleDateString('pt-BR')} às {selectedBooking.departureTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Informações de Pagamento</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Valor:</Text>
                    <Text style={styles.detailValue}>R$ {selectedBooking.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBooking.paymentStatus) }]}>
                      <Text style={styles.statusText}>{getPaymentLabel(selectedBooking.paymentStatus)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <Text style={styles.actionTitle}>Ações</Text>
                  
                  <View style={styles.actionGroup}>
                    <Text style={styles.actionLabel}>Alterar Status da Reserva:</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                        onPress={() => handleUpdateStatus('confirmed')}
                      >
                        <Text style={styles.actionButtonText}>Confirmar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
                        onPress={() => handleUpdateStatus('pending')}
                      >
                        <Text style={styles.actionButtonText}>Pendente</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleUpdateStatus('cancelled')}
                      >
                        <Text style={styles.actionButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.actionGroup}>
                    <Text style={styles.actionLabel}>Alterar Status do Pagamento:</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                        onPress={() => handleUpdatePayment('paid')}
                      >
                        <Text style={styles.actionButtonText}>Pago</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
                        onPress={() => handleUpdatePayment('pending')}
                      >
                        <Text style={styles.actionButtonText}>Pendente</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
                        onPress={() => handleUpdatePayment('refunded')}
                      >
                        <Text style={styles.actionButtonText}>Reembolsar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
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
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minHeight: 50,
  },
  filterPicker: {
    flex: 1,
    height: 50,
    color: '#1F2937',
  },
  listContainer: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingCode: {
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
  bookingInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
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
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionGroup: {
    marginBottom: 20,
  },
  actionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
