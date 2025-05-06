import React from 'react';
import { useRouter } from 'expo-router'; 
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert
} from 'react-native';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminPage() {
  const router = useRouter();
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<'admin' | 'teacher'>('admin');
  const { logout } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      fetchTeachers();
    }, [])
  );

  const fetchTeachers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await apiClient.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users');
    }
  };

  const filteredUsers = teachers.filter(user => user.role === activeTab);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={[styles.cardRoleStrip, item.role === 'admin' ? styles.adminStrip : styles.teacherStrip]}>
        <MaterialIcons 
          name={item.role === 'admin' ? 'admin-panel-settings' : 'person'} 
          size={18} 
          color="white" 
        />
        <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
        <View style={styles.detailContainer}>
          <View style={styles.detailRow}>
            <MaterialIcons name="alternate-email" size={16} color="#7f8c8d" />
            <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{item.username}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={16} color="#7f8c8d" />
            <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{item.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={16} color="#7f8c8d" />
            <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{item.contact}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.studentsButton]}
            onPress={() => router.push("/admin/PresentStudentsScreen")}
          >
            <MaterialIcons name="list-alt" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.notifyButton]}
            onPress={() => router.push("/admin/NotifyParentsScreen")}
          >
            <MaterialIcons name="notifications" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => router.push("/admin/UserForm")}
          >
            <MaterialIcons name="person-add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={[styles.statCard, activeTab === 'admin' && styles.activeStatCard]} 
          onPress={() => setActiveTab('admin')}
        >
          <Text style={[styles.statNumber, activeTab === 'admin' && styles.activeStatText]}>
            {teachers.filter(u => u.role === 'admin').length}
          </Text>
          <Text style={[styles.statLabel, activeTab === 'admin' && styles.activeStatText]}>ADMINS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, activeTab === 'teacher' && styles.activeStatCard]} 
          onPress={() => setActiveTab('teacher')}
        >
          <Text style={[styles.statNumber, activeTab === 'teacher' && styles.activeStatText]}>
            {teachers.filter(u => u.role === 'teacher').length}
          </Text>
          <Text style={[styles.statLabel, activeTab === 'teacher' && styles.activeStatText]}>teacher</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tabTitle}>
        {activeTab === 'admin' ? 'Administrator List' : 'Teacher List'}
      </Text>

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="group" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No {activeTab}s found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <MaterialIcons name="logout" size={24} color="#E74C3C" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 250, 240, 1.00)',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    borderRadius: 14,
    padding: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  studentsButton: {
    backgroundColor: '#9b59b6',
  },
  notifyButton: {
    backgroundColor: '#e67e22',
  },
  addButton: {
    backgroundColor: '#3498db',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeStatCard: {
    backgroundColor: '#3498db',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeStatText: {
    color: 'white',
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    marginTop: 8,
  },
  listContent: {
    padding: 8,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#2c3e50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    flex: 1,
    margin: 8,
  },
  cardRoleStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  adminStrip: {
    backgroundColor: '#3498db',
  },
  teacherStrip: {
    backgroundColor: '#27ae60',
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#dfe6e9',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
  },
  detailContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#34495e',
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDEDEC',
    padding: 15,
    borderRadius: 12,
    marginTop: 16,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
    marginLeft: 10,
  },
});