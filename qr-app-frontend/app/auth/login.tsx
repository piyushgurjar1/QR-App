import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import apiClient from '../api/apiClient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const handleLogin = async () => {
    setUsernameError('');
    setPasswordError('');
    setLoginError(''); 
    
    if (!username) {
      setUsernameError('Username is required');
    }
    if (!password) {
      setPasswordError('Password is required');
    }

    if (!username || !password) {
      return;
    }

    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { token, role } = response.data;
      await AsyncStorage.setItem('userToken', token);
    
      if (role === 'admin') {
        router.push('/admin/admin_home');
      } else if (role === 'caretaker') {
        router.push('/careTaker/careTaker_home');
      } else {
        router.push('/parent/parent_home');
      }
    } catch (error: any) {
      setLoginError('Incorrect username or password'); 
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
     
      
      <Image source={require('../../assets/school_banner.png')} style={styles.banner} />
      <Text style={styles.title}>Login</Text>
      {loginError ? <Text style={styles.loginErrorText}>{loginError}</Text> : null}
      <TextInput 
        style={[styles.input, usernameError && styles.inputError]}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        onFocus={() => setLoginError('')} // Clear login error when user starts typing
      />
      {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
      
      <TextInput 
        style={[styles.input, passwordError && styles.inputError]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onFocus={() => setLoginError('')} // Clear login error when user starts typing
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/auth/register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf0', 
    justifyContent: 'center',
    padding: 20,
  },
  banner: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  loginErrorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00509e',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#00509e',
    fontSize: 16,
  },
});
