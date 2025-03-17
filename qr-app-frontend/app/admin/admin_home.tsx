import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router'; 
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminPage() {
  const router = useRouter(); 
  const [caretakers, setCaretakers] = useState<any[]>([]);
  const [isAddingCaretaker, setIsAddingCaretaker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    username: '',
    password: '',
    role: 'caretaker'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCaretakers = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await apiClient.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCaretakers(response.data || []);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch users');
      }
    };
    fetchCaretakers();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!emailRegex.test(formData.email)) errors.email = 'Valid email required';
    if (!phoneRegex.test(formData.contact)) errors.contact = 'Valid 10-digit number required';
    if (!formData.username.trim()) errors.username = 'Username required';
    if (formData.password.length < 6) errors.password = 'Minimum 6 characters';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCaretaker = async () => {
    if (!validateForm()) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await apiClient.post('/admin/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCaretakers(prev => [...prev, response.data]);
      setIsAddingCaretaker(false);
      setFormData({ name: '', email: '', contact: '', username: '', password: '', role: 'caretaker' });
      Alert.alert('Success', 'User added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
    }
  };

  // Enhanced user card without action buttons.
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={[styles.cardRoleStrip, item.role === 'admin' ? styles.adminStrip : styles.caretakerStrip]}>
        <MaterialIcons 
          name={item.role === 'admin' ? 'admin-panel-settings' : 'person'} 
          size={18} 
          color="white" 
        />
        <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.userName}>{item.name}</Text>
        <View style={styles.detailContainer}>
          <View style={styles.detailRow}>
            <MaterialIcons name="alternate-email" size={16} color="#7f8c8d" />
            <Text style={styles.detailText}>{item.username}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={16} color="#7f8c8d" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={16} color="#7f8c8d" />
            <Text style={styles.detailText}>{item.contact}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const RoleSelector = () => (
    <View style={styles.roleContainer}>
      <TouchableOpacity
        style={[styles.roleButton, formData.role === 'admin' && styles.selectedRole]}
        onPress={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
      >
        <Text style={[styles.roleButtonText, formData.role === 'admin' && styles.selectedRoleText]}>
          Admin
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.roleButton, formData.role === 'caretaker' && styles.selectedRole]}
        onPress={() => setFormData(prev => ({ ...prev, role: 'caretaker' }))}
      >
        <Text style={[styles.roleButtonText, formData.role === 'caretaker' && styles.selectedRoleText]}>
          Caretaker
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      router.push("/");
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingCaretaker(true)}
        >
          <MaterialIcons name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {caretakers.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="group" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={caretakers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Logout Button on main page */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="#E74C3C" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={isAddingCaretaker} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <TouchableOpacity onPress={() => setIsAddingCaretaker(false)}>
                <MaterialIcons name="close" size={28} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.sectionLabel}>Personal Information</Text>
              
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                placeholder="Full Name"
                value={formData.name}
                onChangeText={text => setFormData(prev => ({ ...prev, name: text }))} 
              />
              {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                placeholder="Email Address"
                value={formData.email}
                onChangeText={text => setFormData(prev => ({ ...prev, email: text }))} 
                keyboardType="email-address"
              />
              {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}

              <TextInput
                style={[styles.input, formErrors.contact && styles.inputError]}
                placeholder="Contact Number"
                value={formData.contact}
                onChangeText={text => setFormData(prev => ({ ...prev, contact: text }))} 
                keyboardType="phone-pad"
              />
              {formErrors.contact && <Text style={styles.errorText}>{formErrors.contact}</Text>}

              <Text style={styles.sectionLabel}>Account Details</Text>
              
              <TextInput
                style={[styles.input, formErrors.username && styles.inputError]}
                placeholder="Username"
                value={formData.username}
                onChangeText={text => setFormData(prev => ({ ...prev, username: text }))} 
              />
              {formErrors.username && <Text style={styles.errorText}>{formErrors.username}</Text>}

              <TextInput
                style={[styles.input, formErrors.password && styles.inputError]}
                placeholder="Password"
                value={formData.password}
                onChangeText={text => setFormData(prev => ({ ...prev, password: text }))} 
                secureTextEntry
              />
              {formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}

              <Text style={styles.sectionLabel}>Select Role</Text>
              <RoleSelector />
            </View>
          </ScrollView>

          <View style={styles.fixedButton}>
            <TouchableOpacity style={styles.submitButton} onPress={handleAddCaretaker}>
              <Text style={styles.submitButtonText}>Create User</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  listContent: {
    paddingHorizontal: 8,
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
  },
  cardRoleStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  adminStrip: {
    backgroundColor: '#2980b9',
  },
  caretakerStrip: {
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
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  detailContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#34495e',
    marginLeft: 8,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 250, 240, 1.00)',
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
  },
  formContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 16,
    marginTop: 24,
  },
  input: {
    backgroundColor: 'white',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
    paddingLeft: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#dfe6e9',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedRole: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  roleButtonText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  selectedRoleText: {
    color: 'white',
  },
  fixedButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 250, 240, 0.9)',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#dfe6e9',
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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
