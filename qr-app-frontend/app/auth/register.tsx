import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../api/apiClient';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    parentMail: '',
    parentContact: '',
    childFirstName: '',
    childLastName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.childFirstName) newErrors.childFirstName = 'Child first name is required';
    if (!formData.childLastName) newErrors.childLastName = 'Child last name is required';
    if (!emailRegex.test(formData.parentMail)) newErrors.parentMail = 'Valid email is required';
    if (!phoneRegex.test(formData.parentContact)) newErrors.parentContact = 'Valid 10-digit number required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords must match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await apiClient.post('/auth/register', {
        parent_mail: formData.parentMail,
        parent_contact: formData.parentContact,
        child_first_name: formData.childFirstName,
        child_last_name: formData.childLastName,
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirmPassword
      });
      
      Alert.alert('Success', 'Registration successful! Please login.');
      router.push('/auth/login');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={require('../../assets/register_logo.png')} 
        style={styles.logo} 
      />
      <Text style={styles.title}>Student Registration</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.sectionLabel}>Child Information</Text>
          <TextInput
            style={[styles.input, errors.childFirstName && styles.inputError]}
            placeholder="Child's First Name"
            value={formData.childFirstName}
            onChangeText={(t) => handleChange('childFirstName', t)}
          />
          {errors.childFirstName && <Text style={styles.errorText}>{errors.childFirstName}</Text>}

          <TextInput
            style={[styles.input, errors.childLastName && styles.inputError]}
            placeholder="Child's Last Name"
            value={formData.childLastName}
            onChangeText={(t) => handleChange('childLastName', t)}
          />
          {errors.childLastName && <Text style={styles.errorText}>{errors.childLastName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.sectionLabel}>Parent Information</Text>
          <TextInput
            style={[styles.input, errors.parentMail && styles.inputError]}
            placeholder="Parent Email"
            value={formData.parentMail}
            onChangeText={(t) => handleChange('parentMail', t)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.parentMail && <Text style={styles.errorText}>{errors.parentMail}</Text>}

          <TextInput
            style={[styles.input, errors.parentContact && styles.inputError]}
            placeholder="Parent Contact"
            value={formData.parentContact}
            onChangeText={(t) => handleChange('parentContact', t)}
            keyboardType="phone-pad"
          />
          {errors.parentContact && <Text style={styles.errorText}>{errors.parentContact}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.sectionLabel}>Account Details</Text>
          <TextInput
            style={[styles.input, errors.username && styles.inputError]}
            placeholder="Username"
            value={formData.username}
            onChangeText={(t) => handleChange('username', t)}
            autoCapitalize="none"
          />
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            value={formData.password}
            onChangeText={(t) => handleChange('password', t)}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(t) => handleChange('confirmPassword', t)}
            secureTextEntry
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => router.push('/')}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'rgba(255, 250, 240, 1.00)', 
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
    paddingLeft: 8,
  },
  input: {
    backgroundColor: 'white',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 12,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '500',
  },
});