// NotifyParentsScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotifyParentsScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [scanType, setScanType] = useState<'checkin' | 'checkout'>('checkin');
  const [scanned, setScanned] = useState(false);

  const handleSubmit = async () => {

    if (!username.trim()) {
      Alert.alert('Error', 'Please enter student username');
      return;
    }
    const token = await AsyncStorage.getItem("userToken");
    try {
        await apiClient.post(
          "/qr/scan",
          { 
            username: username,
            eventType: scanType 
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        Alert.alert(
          "Success",
          `Student ${scanType === 'checkin' ? 'checked-in' : 'checked-out'} successfully`, 
          [
            {
              text: "OK",
              onPress: () => {
                setScanned(false);
              },
            },
          ]
        );
      } catch (error) {
        console.error("Error sending QR data:", error);
        Alert.alert("Error", `Failed to process ${scanType}`, [
          { text: "OK", onPress: () => setScanned(false) },
        ]);
      }
    };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notify Parents</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={28} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Student Username"
          placeholderTextColor="#95a5a6"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              scanType === 'checkin' && styles.activeToggle
            ]}
            onPress={() => setScanType('checkin')}
          >
            <MaterialIcons 
              name="login" 
              size={24} 
              color={scanType === 'checkin' ? 'white' : '#2c3e50'} 
            />
            <Text style={[
              styles.toggleText,
              scanType === 'checkin' && styles.activeToggleText
            ]}>
              Check-in
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              scanType === 'checkout' && styles.activeToggle
            ]}
            onPress={() => setScanType('checkout')}
          >
            <MaterialIcons 
              name="logout" 
              size={24} 
              color={scanType === 'checkout' ? 'white' : '#2c3e50'} 
            />
            <Text style={[
              styles.toggleText,
              scanType === 'checkout' && styles.activeToggleText
            ]}>
              Check-out
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={!username.trim()}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    color: '#2c3e50',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    gap: 8,
  },
  activeToggle: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  activeToggleText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    opacity: 1,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});