import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

export default function RegisterStudentsFromCSV() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'], // More specific CSV types
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
          Alert.alert('Error', 'Please select a valid CSV file');
          return;
        }
        
        setSelectedFile(file);
        setProgress(0);
        setSuccessCount(0);
        setErrorCount(0);
        setResults([]);
      }
    } catch (err) {
      console.error('Document picker error:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const readFileContent = async (file: any): Promise<string> => {
    try {
      if (Platform.OS === 'web') {
        // For web platform
        const response = await fetch(file.uri);
        if (!response.ok) {
          throw new Error(`Failed to read file: ${response.statusText}`);
        }
        return await response.text();
      } else {
        // For mobile platforms (iOS/Android)
        // Check if file exists and is readable
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        if (!fileInfo.exists) {
          throw new Error('File does not exist or is not accessible');
        }
        
        return await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.UTF8
        });
      }
    } catch (error: any) {
      console.error('File reading error:', error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  };

  const registerStudents = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a valid CSV file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    setResults([]);
   
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
    
      const content = await readFileContent(selectedFile);
      
      if (!content || content.trim() === '') {
        throw new Error('File is empty or could not be read');
      }
    
      
      const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }
      
      // Remove header row
      const headerRow = lines.shift();
      
      
      const dataLines = lines;
      setTotalStudents(dataLines.length);

      let currentSuccessCount = 0;
      let currentErrorCount = 0;
      const currentResults: any[] = [];

      for (let i = 0; i < dataLines.length; i++) {
        try {
          
          // Use improved CSV parsing
          const fields = parseCSVLine(dataLines[i]);

          if (fields.length < 7) {
            throw new Error(`Invalid CSV format - expected 7 fields, got ${fields.length}`);
          }

          const [
            parent_mail,
            parent_contact,
            child_first_name,
            child_last_name,
            username,
            password,
            confirm_password
          ] = fields;

          // Validate required fields
          if (!parent_mail?.trim() || !parent_contact?.trim() || !child_first_name?.trim() || !username?.trim() || !password?.trim()) {
            throw new Error('Missing required fields');
          }

          if (password.trim() !== confirm_password?.trim()) {
            throw new Error('Passwords do not match');
          }

          console.log('Registering student:', username);

          // Register student
          const response = await apiClient.post(
            '/auth/register',
            {
              parent_mail: parent_mail.trim(),
              parent_contact: parent_contact.trim(),
              child_first_name: child_first_name.trim(),
              child_last_name: child_last_name?.trim() || '',
              username: username.trim(),
              password: password.trim(),
              confirm_password: confirm_password?.trim()
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          console.log('Registration successful for:', username);
          currentSuccessCount++;
          currentResults.push({
            username: username.trim(),
            status: 'success',
            message: 'Registered successfully'
          });
          
          setSuccessCount(currentSuccessCount);
        } catch (error: any) {
          console.error(`Error registering student on line ${i + 1}:`, error);
          currentErrorCount++;
          
          const username = parseCSVLine(dataLines[i])[4]?.trim() || `Row ${i + 1}`;
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          
          currentResults.push({
            username,
            status: 'error',
            message: errorMessage
          });
          
          setErrorCount(currentErrorCount);
        }
        
        setProgress(i + 1);
        setResults([...currentResults]);
        
        // Small delay to prevent overwhelming the server
        if (i < dataLines.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      Alert.alert(
        'Registration Complete',
        `Successfully registered ${currentSuccessCount} students. ${currentErrorCount} failed.`
      );
    } catch (error: any) {
      console.error('Registration process error:', error);
      Alert.alert('Error', error.message || 'Failed to process CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>      
        <Text style={styles.title}>Register Students</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instructions}>
          CSV Format: parent_mail, parent_contact, child_first_name, child_last_name, username, password, confirm_password
        </Text>
        
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={pickDocument}
          disabled={isProcessing}
        >
          <MaterialIcons name="cloud-upload" size={28} color="white" />
          <Text style={styles.buttonText}>
            {selectedFile ? selectedFile.name : 'Select CSV File'}
          </Text>
        </TouchableOpacity>

        {selectedFile && (
          <View>
            <TouchableOpacity 
              style={[styles.registerButton, isProcessing && styles.disabledButton]} 
              onPress={registerStudents}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>
                {isProcessing ? 'Processing...' : 'Register Students'}
              </Text>
            </TouchableOpacity>

            {isProcessing && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Processed: {progress}/{totalStudents}
                </Text>
                <Text style={styles.progressText}>
                  Success: {successCount} | Errors: {errorCount}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${totalStudents > 0 ? (progress / totalStudents) * 100 : 0}%` }]} />
                </View>
              </View>
            )}

            {results.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.sectionTitle}>Registration Results:</Text>
                <ScrollView style={styles.resultsScroll}>
                  {results.map((result, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.resultItem,
                        result.status === 'success' ? styles.successItem : styles.errorItem
                      ]}
                    >
                      <Text style={styles.resultUsername}>{result.username}</Text>
                      <Text style={styles.resultMessage}>{result.message}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 250, 240, 1.00)',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a085',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  progressContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  progressText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultsScroll: {
    maxHeight: 300,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  resultItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  successItem: {
    backgroundColor: '#d5f5e3',
  },
  errorItem: {
    backgroundColor: '#fadbd8',
  },
  resultUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  resultMessage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});