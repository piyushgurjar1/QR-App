import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';

export default function CareTakerHomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await apiClient.get('/caretaker/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
    } catch (error) {
      console.log('Error fetching user data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      router.push('/');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const handleScanRedirect = () => {
    router.push('/careTaker/scanner');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Loading Your Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <MaterialIcons name="account-circle" size={80} color="#2C3E50" />
          <View style={styles.profileTextContainer}>
            <Text style={styles.welcomeText}>{userData?.name}</Text>
            <Text style={styles.roleText}>{userData?.role.toUpperCase()}</Text>
          </View>
        </View>
        
        {/* Scan FAB Button */}
        <TouchableOpacity style={styles.scanFab} onPress={handleScanRedirect}>
          <MaterialIcons name="qr-code-scanner" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="person" size={24} color="#2C3E50" />
          <Text style={styles.cardTitle}>Profile Information</Text>
        </View>

        <InfoRow icon="alternate-email" label="Username" value={userData?.username} />
        <InfoRow icon="email" label="Email" value={userData?.email} />
        <InfoRow icon="phone" label="Contact" value={userData?.contact} />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon} size={20} color="#E67E22" />
    <View style={styles.infoTextContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'rgba(255, 250, 240, 1.00)',
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 250, 240, 1.00)',
  },
  loadingText: {
    fontSize: 16,
    color: '#2C3E50',
    marginTop: 20,
    fontFamily: 'Roboto-Medium',
  },
  header: {
    backgroundColor: '#FDF5E6',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileTextContainer: {
    marginLeft: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    fontFamily: 'Roboto-Bold',
  },
  roleText: {
    fontSize: 14,
    color: '#E67E22',
    fontWeight: '600',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  scanFab: {
    position: 'absolute',
    right: 25,
    top: 25,
    backgroundColor: '#27ae60',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 25,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7DC',
    paddingBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 10,
    fontFamily: 'Roboto-Medium',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F1EB',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  label: {
    fontSize: 14,
    color: '#95A5A6',
    fontFamily: 'Roboto-Regular',
  },
  value: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
    marginTop: 4,
    fontFamily: 'Roboto-Medium',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    fontFamily: 'Roboto-Medium',
  },
});