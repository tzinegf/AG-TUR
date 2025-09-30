import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

export default function TicketsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingTickets = [
    {
      id: '1',
      from: 'São Paulo',
      to: 'Rio de Janeiro',
      date: '2025-01-20',
      time: '14:30',
      seat: '15A',
      price: 'R$ 89,90',
      status: 'confirmed',
      busNumber: 'AG001',
      platform: '3',
    },
    {
      id: '2',
      from: 'Brasília',
      to: 'Goiânia',
      date: '2025-01-25',
      time: '08:00',
      seat: '12B',
      price: 'R$ 45,90',
      status: 'confirmed',
      busNumber: 'AG015',
      platform: '1',
    },
  ];

  const pastTickets = [
    {
      id: '3',
      from: 'Belo Horizonte',
      to: 'Salvador',
      date: '2024-12-15',
      time: '22:00',
      seat: '08C',
      price: 'R$ 129,90',
      status: 'completed',
      busNumber: 'AG008',
      platform: '2',
    },
  ];

  const renderTicket = (ticket: any) => (
    <View key={ticket.id} style={styles.ticketCard}>
      <LinearGradient
        colors={['#DC2626', '#7C3AED']}
        style={styles.ticketHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.routeInfo}>
          <Text style={styles.cityText}>{ticket.from}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          <Text style={styles.cityText}>{ticket.to}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, 
            ticket.status === 'confirmed' && styles.confirmedBadge,
            ticket.status === 'completed' && styles.completedBadge
          ]}>
            <Text style={styles.statusText}>
              {ticket.status === 'confirmed' ? 'Confirmado' : 'Concluído'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.ticketBody}>
        <View style={styles.ticketDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.detailLabel}>Data</Text>
              <Text style={styles.detailValue}>{new Date(ticket.date).toLocaleDateString('pt-BR')}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text style={styles.detailLabel}>Horário</Text>
              <Text style={styles.detailValue}>{ticket.time}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="car" size={16} color="#6B7280" />
              <Text style={styles.detailLabel}>Ônibus</Text>
              <Text style={styles.detailValue}>{ticket.busNumber}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.detailLabel}>Plataforma</Text>
              <Text style={styles.detailValue}>{ticket.platform}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="person" size={16} color="#6B7280" />
              <Text style={styles.detailLabel}>Assento</Text>
              <Text style={styles.detailValue}>{ticket.seat}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="card" size={16} color="#6B7280" />
              <Text style={styles.detailLabel}>Valor</Text>
              <Text style={styles.detailValue}>{ticket.price}</Text>
            </View>
          </View>
        </View>

        {ticket.status === 'confirmed' && (
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={`AG-TUR-${ticket.id}-${ticket.date}-${ticket.seat}`}
              size={80}
              color="#1F2937"
              backgroundColor="#FFFFFF"
            />
            <Text style={styles.qrCodeText}>Apresente este código</Text>
          </View>
        )}
      </View>

      <View style={styles.ticketActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="download" size={20} color="#DC2626" />
          <Text style={styles.actionButtonText}>Baixar PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share" size={20} color="#DC2626" />
          <Text style={styles.actionButtonText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Passagens</Text>
        <Text style={styles.subtitle}>Gerencie suas viagens</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Próximas Viagens
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'upcoming' ? (
          upcomingTickets.length > 0 ? (
            upcomingTickets.map(renderTicket)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Nenhuma viagem agendada</Text>
              <Text style={styles.emptySubtitle}>
                Que tal planejar sua próxima aventura?
              </Text>
              <TouchableOpacity style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Buscar Passagens</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          pastTickets.length > 0 ? (
            pastTickets.map(renderTicket)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Nenhuma viagem anterior</Text>
              <Text style={styles.emptySubtitle}>
                Suas viagens passadas aparecerão aqui
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#DC2626',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  ticketHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confirmedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  completedBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ticketBody: {
    padding: 20,
    flexDirection: 'row',
    gap: 20,
  },
  ticketDetails: {
    flex: 1,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  qrCodeContainer: {
    alignItems: 'center',
    gap: 8,
  },
  qrCodeText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  ticketActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
