import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

export default function RegisterStudentsFromCSV() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
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
        setTotalStudents(0);
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

  const parseCSVData = (content: string) => {
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }
    
    // Remove header row
    const headerRow = lines.shift();
    console.log('Header row:', headerRow);
    
    const students = [];
    const invalidRows = [];

    for (let i = 0; i < lines.length; i++) {
      try {
        const fields = parseCSVLine(lines[i]);

        if (fields.length < 7) {
          invalidRows.push({
            row: i + 2, // +2 because we removed header and arrays are 0-indexed
            error: `Invalid CSV format - expected 7 fields, got ${fields.length}`,
            data: lines[i]
          });
          continue;
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
          invalidRows.push({
            row: i + 2,
            error: 'Missing required fields',
            username: username?.trim() || `Row ${i + 2}`,
            data: lines[i]
          });
          continue;
        }

        if (password.trim() !== confirm_password?.trim()) {
          invalidRows.push({
            row: i + 2,
            error: 'Passwords do not match',
            username: username.trim(),
            data: lines[i]
          });
          continue;
        }

        students.push({
          parent_mail: parent_mail.trim(),
          parent_contact: parent_contact.trim(),
          child_first_name: child_first_name.trim(),
          child_last_name: child_last_name?.trim() || '',
          username: username.trim(),
          password: password.trim(),
          confirm_password: confirm_password?.trim()
        });

      } catch (error: any) {
        invalidRows.push({
          row: i + 2,
          error: error.message || 'Failed to parse row',
          username: `Row ${i + 2}`,
          data: lines[i]
        });
      }
    }

    return { students, invalidRows };
  };

  const registerStudents = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a valid CSV file first');
      return;
    }

    setIsProcessing(true);
    setSuccessCount(0);
    setErrorCount(0);
    setResults([]);
   
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Reading file content...');
      const content = await readFileContent(selectedFile);
      
      if (!content || content.trim() === '') {
        throw new Error('File is empty or could not be read');
      }

      console.log('Parsing CSV data...');
      const { students, invalidRows } = parseCSVData(content);
      
      console.log(`Found ${students.length} valid students and ${invalidRows.length} invalid rows`);
      
      // Set total students including invalid ones for proper counting
      setTotalStudents(students.length + invalidRows.length);

      // Add invalid rows to results immediately
      const initialResults = invalidRows.map(row => ({
        username: row.username,
        status: 'error',
        message: row.error
      }));

      setResults(initialResults);
      setErrorCount(invalidRows.length);

      if (students.length === 0) {
        Alert.alert('Error', 'No valid student data found in CSV file');
        return;
      }

      console.log('Sending bulk registration request...');
      
      // Send bulk registration request
      const response = await apiClient.post(
        '/auth/registerBulk', // Assuming this is your bulk endpoint
        { students },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Bulk registration response:', response.data);

      // Process results from bulk API
      const bulkResults = response.data.results || [];
      const successResults = bulkResults.filter((result: any) => result.status === 'success');
      const errorResults = bulkResults.filter((result: any) => result.status === 'error');

      // Update state with final results
      const finalResults = [...initialResults, ...bulkResults];
      setResults(finalResults);
      setSuccessCount(successResults.length);
      setErrorCount(invalidRows.length + errorResults.length);

      // Show completion alert
      const totalSuccess = successResults.length;
      const totalErrors = invalidRows.length + errorResults.length;
      
      Alert.alert(
        'Registration Complete',
        `Successfully registered ${totalSuccess} students.\n${totalErrors} failed.`
      );

    } catch (error: any) {
      console.error('Registration process error:', error);
      
      let errorMessage = 'Failed to process CSV file';
      
      if (error.response) {
        // API error
        errorMessage = error.response.data?.message || error.response.data?.error || 'Server error occurred';
      } else if (error.message) {
        // Other errors (file reading, parsing, etc.)
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderResultItem = ({ item, index }: { item: any; index: number }) => (
    <View 
      style={[
        styles.resultItem,
        item.status === 'success' ? styles.successItem : styles.errorItem
      ]}
    >
      <Text style={styles.resultUsername}>{item.username}</Text>
      <Text style={styles.resultMessage}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>      
        <Text style={styles.title}>Register Students</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Fixed content area - not scrollable */}
      <View style={styles.fixedContent}>
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
          <View style={styles.fileSelectedContainer}>
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
                  Processing bulk registration...
                </Text>
                <Text style={styles.progressText}>
                  Please wait while we register all students
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, styles.indeterminateProgress]} />
                </View>
              </View>
            )}

            {!isProcessing && totalStudents > 0 && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Total Students: {totalStudents}
                </Text>
                <Text style={styles.progressText}>
                  Success: {successCount} | Errors: {errorCount}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Results section - independently scrollable and takes remaining space */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Registration Results:</Text>
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item, index) => `result-${index}`}
            showsVerticalScrollIndicator={true}
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
          />
        </View>
      )}
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
  fixedContent: {
    // This will take only the space it needs
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
  fileSelectedContainer: {
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
    marginBottom: 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  progressText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
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
  indeterminateProgress: {
    width: '100%',
    opacity: 0.7,
  },
  resultsContainer: {
    flex: 1, // Takes remaining space
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  resultsList: {
    flex: 1, // Takes all available space in resultsContainer
  },
  resultsContent: {
    paddingBottom: 10,
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