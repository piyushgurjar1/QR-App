// auth/login.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from './AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [deviceToken, setDeviceToken] = useState(''); 
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Get device token on component mount using expo-notifications
  useEffect(() => {
    const getFCMToken = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission not granted', 'Push notifications permission was not granted');
          return;
        }
        const firebaseTokenResponse = await Notifications.getDevicePushTokenAsync();
        setDeviceToken(firebaseTokenResponse.data);
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    getFCMToken();
  }, []);

  const handleLogin = async () => {
    // Clear any previous errors
    setUsernameError('');
    setPasswordError('');
    setLoginError('');
    
    // Validate required fields
    if (!username) setUsernameError('Username is required');
    if (!password) setPasswordError('Password is required');
    if (!username || !password) return;

    try {
      const result = await login(username, password, deviceToken);
      
      if (!result.success) {
        setLoginError(result.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
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
        onFocus={() => setLoginError('')}
      />
      {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
      
      <View style={[styles.passwordContainer, passwordError && styles.inputError]}>
        <TextInput 
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          onFocus={() => setLoginError('')}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          <MaterialCommunityIcons 
            name={passwordVisible ? 'eye-off' : 'eye'} 
            size={24} 
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
  },
  eyeIcon: {
    padding: 10,
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
