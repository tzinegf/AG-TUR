import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, signOut } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut();
              // Navigate to auth screen after logout
              router.replace('/auth');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
            }
          }
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update functionality
    setIsEditing(false);
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  };

  const ProfileItem = ({ icon, label, value, editable = false, onChangeText }: {
    icon: string;
    label: string;
    value: string;
    editable?: boolean;
    onChangeText?: (text: string) => void;
  }) => (
    <View style={[styles.profileItem, { borderBottomColor: colors.text + '20' }]}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon as any} size={24} color={colors.tint} />
        <Text style={[styles.profileLabel, { color: colors.text }]}>{label}</Text>
      </View>
      {isEditing && editable ? (
        <TextInput
          style={[styles.profileInput, { color: colors.text, borderColor: colors.tint }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Digite seu ${label.toLowerCase()}`}
          placeholderTextColor={colors.text + '60'}
        />
      ) : (
        <Text style={[styles.profileValue, { color: colors.text }]}>
          {value || 'Não informado'}
        </Text>
      )}
    </View>
  );

  const MenuOption = ({ icon, title, subtitle, onPress, danger = false }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuOption, { borderBottomColor: colors.text + '20' }]}
      onPress={onPress}
    >
      <View style={styles.menuOptionLeft}>
        <Ionicons
          name={icon as any}
          size={24}
          color={danger ? '#FF4444' : colors.tint}
        />
        <View style={styles.menuOptionText}>
          <Text style={[styles.menuTitle, { color: danger ? '#FF4444' : colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.menuSubtitle, { color: colors.text + '60' }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text + '60'} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.userName}>
            {user?.name || 'Usuário'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Informações Pessoais
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              style={[styles.editButton, { backgroundColor: colors.tint }]}
            >
              <Ionicons
                name={isEditing ? 'checkmark' : 'pencil'}
                size={16}
                color="white"
              />
              <Text style={styles.editButtonText}>
                {isEditing ? 'Salvar' : 'Editar'}
              </Text>
            </TouchableOpacity>
          </View>

          <ProfileItem
            icon="person-outline"
            label="Nome"
            value={editedName}
            editable={true}
            onChangeText={setEditedName}
          />
          <ProfileItem
            icon="mail-outline"
            label="E-mail"
            value={user?.email || ''}
          />
          <ProfileItem
            icon="call-outline"
            label="Telefone"
            value={editedPhone}
            editable={true}
            onChangeText={setEditedPhone}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Configurações
          </Text>
          
          <MenuOption
            icon="notifications-outline"
            title="Notificações"
            subtitle="Gerencie suas notificações"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          />
          
          <MenuOption
            icon="shield-outline"
            title="Privacidade e Segurança"
            subtitle="Alterar senha e configurações de privacidade"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          />
          
          <MenuOption
            icon="help-circle-outline"
            title="Ajuda e Suporte"
            subtitle="Central de ajuda e contato"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          />
          
          <MenuOption
            icon="information-circle-outline"
            title="Sobre o App"
            subtitle="Versão 1.0.0"
            onPress={() => Alert.alert('AGTur', 'Aplicativo de passagens rodoviárias\nVersão 1.0.0')}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <MenuOption
            icon="log-out-outline"
            title="Sair da Conta"
            onPress={handleLogout}
            danger={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileLabel: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  profileValue: {
    fontSize: 16,
    textAlign: 'right',
    flex: 1,
  },
  profileInput: {
    fontSize: 16,
    textAlign: 'right',
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  menuOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuOptionText: {
    marginLeft: 15,
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
