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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: 'user' | 'admin' | 'manager' | 'driver';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
  totalBookings: number;
  totalSpent: number;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      role: 'user',
      status: 'active',
      createdAt: '2024-01-01',
      lastLogin: '2024-01-15',
      totalBookings: 12,
      totalSpent: 1450.00,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      emailVerified: true,
      phoneVerified: true,
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(21) 99876-5432',
      cpf: '987.654.321-00',
      role: 'user',
      status: 'active',
      createdAt: '2023-12-15',
      lastLogin: '2024-01-14',
      totalBookings: 8,
      totalSpent: 920.50,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      emailVerified: true,
      phoneVerified: false,
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '(31) 91234-5678',
      cpf: '456.789.123-00',
      role: 'driver',
      status: 'active',
      createdAt: '2023-11-20',
      lastLogin: '2024-01-15',
      totalBookings: 0,
      totalSpent: 0,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      emailVerified: true,
      phoneVerified: true,
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '(41) 98765-1234',
      cpf: '789.123.456-00',
      role: 'manager',
      status: 'active',
      createdAt: '2023-10-10',
      lastLogin: '2024-01-15',
      totalBookings: 0,
      totalSpent: 0,
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
      emailVerified: true,
      phoneVerified: true,
    },
    {
      id: '5',
      name: 'Pedro Almeida',
      email: 'pedro.almeida@email.com',
      phone: '(51) 99999-8888',
      cpf: '321.654.987-00',
      role: 'user',
      status: 'suspended',
      createdAt: '2023-09-05',
      lastLogin: '2023-12-20',
      totalBookings: 3,
      totalSpent: 350.00,
      emailVerified: false,
      phoneVerified: false,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin' | 'manager' | 'driver'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    role: 'user' as 'user' | 'admin' | 'manager' | 'driver',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    emailVerified: false,
    phoneVerified: false,
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.cpf.includes(searchQuery) ||
      user.phone.includes(searchQuery);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      role: 'user',
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
    });
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    });
    setModalVisible(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsModalVisible(true);
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setUsers(users.filter(user => user.id !== userId));
            Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
          },
        },
      ]
    );
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email || !formData.cpf) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingUser) {
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      ));
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: '-',
        totalBookings: 0,
        totalSpent: 0,
      };
      setUsers([...users, newUser]);
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
    }

    setModalVisible(false);
  };

  const handleResetPassword = (user: User) => {
    Alert.alert(
      'Resetar Senha',
      `Enviar email de redefinição de senha para ${user.email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            Alert.alert('Sucesso', 'Email de redefinição de senha enviado!');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'suspended': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user': return 'Usuário';
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'driver': return 'Motorista';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#DC2626';
      case 'manager': return '#7C3AED';
      case 'driver': return '#2563EB';
      case 'user': return '#059669';
      default: return '#6B7280';
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleViewDetails(item)}>
      <View style={styles.userHeader}>
        <Image 
          source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=DC2626&color=fff` }} 
          style={styles.userAvatar} 
        />
        <View style={styles.userInfo}>
          <View style={styles.userTopRow}>
            <Text style={styles.userName}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>
                {item.status === 'active' ? 'Ativo' : item.status === 'inactive' ? 'Inativo' : 'Suspenso'}
              </Text>
            </View>
          </View>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.userDetails}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
              <Text style={styles.roleText}>{getRoleLabel(item.role)}</Text>
            </View>
            <View style={styles.verificationIcons}>
              {item.emailVerified && (
                <Ionicons name="mail-outline" size={14} color="#10B981" />
              )}
              {item.phoneVerified && (
                <Ionicons name="call-outline" size={14} color="#10B981" />
              )}
            </View>
          </View>
          {item.role === 'user' && (
            <View style={styles.userStats}>
              <Text style={styles.statText}>
                <Text style={styles.statLabel}>Reservas:</Text> {item.totalBookings}
              </Text>
              <Text style={styles.statText}>
                <Text style={styles.statLabel}>Total:</Text> R$ {item.totalSpent.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditUser(item)}
        >
          <Ionicons name="pencil" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleResetPassword(item)}
        >
          <Ionicons name="key" size={20} color="#F59E0B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteUser(item.id)}
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
        <Text style={styles.headerTitle}>Gerenciar Usuários</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Ionicons name="person-add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Novo Usuário</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#DC2626" />
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Usuários</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.statValue}>{users.filter(u => u.status === 'active').length}</Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="person" size={24} color="#059669" />
          <Text style={styles.statValue}>{users.filter(u => u.role === 'user').length}</Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="bus" size={24} color="#2563EB" />
          <Text style={styles.statValue}>{users.filter(u => u.role === 'driver').length}</Text>
          <Text style={styles.statLabel}>Motoristas</Text>
        </View>
      </ScrollView>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, email, CPF ou telefone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Função:</Text>
            <Picker
              selectedValue={filterRole}
              onValueChange={setFilterRole}
              style={styles.picker}
            >
              <Picker.Item label="Todos" value="all" />
              <Picker.Item label="Usuário" value="user" />
              <Picker.Item label="Administrador" value="admin" />
              <Picker.Item label="Gerente" value="manager" />
              <Picker.Item label="Motorista" value="driver" />
            </Picker>
          </View>
          
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Status:</Text>
            <Picker
              selectedValue={filterStatus}
              onValueChange={setFilterStatus}
              style={styles.picker}
            >
              <Picker.Item label="Todos" value="all" />
              <Picker.Item label="Ativo" value="active" />
              <Picker.Item label="Inativo" value="inactive" />
              <Picker.Item label="Suspenso" value="suspended" />
            </Picker>
          </View>
        </View>
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
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
                {editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome Completo *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="João Silva"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="email@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="(11) 98765-4321"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>CPF *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cpf}
                  onChangeText={(text) => setFormData({ ...formData, cpf: text })}
                  placeholder="123.456.789-00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Função</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    style={styles.formPicker}
                  >
                    <Picker.Item label="Usuário" value="user" />
                    <Picker.Item label="Administrador" value="admin" />
                    <Picker.Item label="Gerente" value="manager" />
                    <Picker.Item label="Motorista" value="driver" />
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
                    <Picker.Item label="Ativo" value="active" />
                    <Picker.Item label="Inativo" value="inactive" />
                    <Picker.Item label="Suspenso" value="suspended" />
                  </Picker>
                </View>
              </View>

              <View style={styles.verificationSection}>
                <Text style={styles.sectionTitle}>Verificações</Text>
                
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Email Verificado</Text>
                  <Switch
                    value={formData.emailVerified}
                    onValueChange={(value) => setFormData({ ...formData, emailVerified: value })}
                    trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
                    thumbColor={formData.emailVerified ? '#FFFFFF' : '#F3F4F6'}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Telefone Verificado</Text>
                  <Switch
                    value={formData.phoneVerified}
                    onValueChange={(value) => setFormData({ ...formData, phoneVerified: value })}
                    trackColor={{ false: '#D1D5DB', true: '#DC2626' }}
                    thumbColor={formData.phoneVerified ? '#FFFFFF' : '#F3F4F6'}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveUser}>
                <Text style={styles.saveButtonText}>
                  {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* User Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Usuário</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailsHeader}>
                  <Image 
                    source={{ uri: selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=DC2626&color=fff` }} 
                    style={styles.detailsAvatar} 
                  />
                  <Text style={styles.detailsName}>{selectedUser.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(selectedUser.role) }]}>
                    <Text style={styles.roleText}>{getRoleLabel(selectedUser.role)}</Text>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Informações de Contato</Text>
                  <View style={styles.detailItem}>
                    <Ionicons name="mail" size={20} color="#6B7280" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailValue}>{selectedUser.email}</Text>
                      {selectedUser.emailVerified && (
                        <Text style={styles.verifiedText}>✓ Verificado</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="call" size={20} color="#6B7280" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Telefone</Text>
                      <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                      {selectedUser.phoneVerified && (
                        <Text style={styles.verifiedText}>✓ Verificado</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="card" size={20} color="#6B7280" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>CPF</Text>
                      <Text style={styles.detailValue}>{selectedUser.cpf}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Informações da Conta</Text>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={20} color="#6B7280" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Cadastrado em</Text>
                      <Text style={styles.detailValue}>{selectedUser.createdAt}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={20} color="#6B7280" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Último acesso</Text>
                      <Text style={styles.detailValue}>{selectedUser.lastLogin}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="shield-checkmark" size={20} color="#6B7280" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedUser.status) }]}>
                        <Text style={styles.statusText}>
                          {selectedUser.status === 'active' ? 'Ativo' : selectedUser.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {selectedUser.role === 'user' && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Estatísticas</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statBox}>
                        <Ionicons name="ticket" size={24} color="#DC2626" />
                        <Text style={styles.statBoxValue}>{selectedUser.totalBookings}</Text>
                        <Text style={styles.statBoxLabel}>Reservas</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Ionicons name="cash" size={24} color="#10B981" />
                        <Text style={styles.statBoxValue}>R$ {selectedUser.totalSpent.toFixed(2)}</Text>
                        <Text style={styles.statBoxLabel}>Total Gasto</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.detailsActions}>
                  <TouchableOpacity 
                    style={[styles.detailActionButton, { backgroundColor: '#3B82F6' }]}
                    onPress={() => {
                      setDetailsModalVisible(false);
                      handleEditUser(selectedUser);
                    }}
                  >
                    <Ionicons name="pencil" size={20} color="#FFFFFF" />
                    <Text style={styles.detailActionText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.detailActionButton, { backgroundColor: '#F59E0B' }]}
                    onPress={() => {
                      setDetailsModalVisible(false);
                      handleResetPassword(selectedUser);
                    }}
                  >
                    <Ionicons name="key" size={20} color="#FFFFFF" />
                    <Text style={styles.detailActionText}>Resetar Senha</Text>
                  </TouchableOpacity>
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
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
  listContainer: {
    padding: 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
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
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verificationIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  userActions: {
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
  formGroup: {
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
  },
  formPicker: {
    height: 50,
  },
  verificationSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
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
  detailsHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  detailsAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
