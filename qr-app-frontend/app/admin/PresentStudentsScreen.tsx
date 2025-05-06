import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function PresentStudentsScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchPresentStudents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await apiClient.get('/admin/childs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data || []);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch present students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentStudents();
  }, []);

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const renderItem = ({ item }: { item: any }) => {
    const dt = formatDateTime(item.timestamp);
    return (
      <View style={styles.row}>
        <Text style={[styles.cell, styles.nameCell]} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cell}>{dt.date}</Text>
        <Text style={styles.cell}>{dt.time}</Text>
      </View>
    );
  };

  const keyExtractor = (item: any) => `${item.id}-${item.timestamp}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Present Students</Text>
        <TouchableOpacity onPress={fetchPresentStudents} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading Students...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={40} color="#E74C3C" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="child-care" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No students present currently</Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.nameHeader]}>Student Name</Text>
            <Text style={styles.headerCell}>Date</Text>
            <Text style={styles.headerCell}>Time</Text>
          </View>
          <FlatList
            data={students}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'rgba(255, 250, 240, 1.00)',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    flex: 1,
    // textAlign: 'center',
    // fontFamily: 'Roboto-Bold',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#EDE7DC',
    paddingBottom: 12,
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  nameHeader: {
    flex: 1.5,
    textAlign: 'left',
    paddingLeft: 16,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F1EB',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#34495E',
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
  },
  nameCell: {
    flex: 1.5,
    textAlign: 'left',
    paddingLeft: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
    fontFamily: 'Roboto-Italic',
  },
});
