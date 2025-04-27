// components/UserForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface UserFormProps {
  onSubmit: (userData: UserData) => void;
  onCancel: () => void;
}

interface UserData {
  name: string;
  email: string;
  contact: string;
  username: string;
  password: string;
  role: 'admin' | 'caretaker';
}

export default function UserForm({ onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    contact: '',
    username: '',
    password: '',
    role: 'caretaker'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New User</Text>
          <TouchableOpacity onPress={onCancel}>
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
            autoCapitalize="none"
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
            autoCapitalize="none"
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
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create User</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(255, 250, 240, 1.00)',
    },
    scrollContainer: {
      padding: 24,
      paddingBottom: 100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
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
    }
  });
  