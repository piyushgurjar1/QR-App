import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

interface QRDownloaderProps {
  value: string;
  size?: number;
  title?: string;
}

interface QRCodeRef {
  toDataURL: (callback: (dataURL: string) => void) => void;
}

const QRDownloader: React.FC<QRDownloaderProps> = ({ 
  value, 
  size = 200,
  title = "QR Code" 
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const qrCodeRef = useRef<QRCodeRef | null>(null);

  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleDownload = async () => {
    try {
      setLoading(true);
      if (!hasPermission) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required', 
            'Please grant permission to save photos in your device settings.',
            [
              { text: 'OK', onPress: () => setLoading(false) }
            ]
          );
          return;
        }
        setHasPermission(true);
      }
      
      // Check if qrCodeRef is available
      if (!qrCodeRef.current) {
        Alert.alert('Error', 'QR Code reference not found');
        setLoading(false);
        return;
      }
      
      // Use toDataURL with proper callback handling
      qrCodeRef.current.toDataURL((dataURL: string) => {
        saveQRCodeToGallery(dataURL);
      });
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to generate QR code');
      setLoading(false);
    }
  };

  const saveQRCodeToGallery = async (dataURL: string) => {
    try {
      // Create a file path in the temporary directory
      const fileName = `qrcode-${Date.now()}.png`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Handle the base64 data - sometimes it includes the prefix, sometimes it doesn't
      let base64Data = dataURL;
      if (dataURL.includes('data:image/png;base64,')) {
        base64Data = dataURL.split('data:image/png;base64,')[1];
      }
      
      // Write the file
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Save to media library using the simpler saveToLibraryAsync method
      await MediaLibrary.saveToLibraryAsync(filePath);
      
      // Delete the temporary file
      await FileSystem.deleteAsync(filePath, { idempotent: true });
      
      // Show success message
      Alert.alert('Success', 'QR Code saved to your gallery');
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code to gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        <QRCode
          value={value}
          size={size}
          ecl="H"
          color="#25313C"
          backgroundColor="#FFFFFF"
          getRef={(ref) => (qrCodeRef.current = ref as unknown as QRCodeRef)}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={handleDownload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Download QR Code</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  qrContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  downloadButton: {
    backgroundColor: '#2C3E50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default QRDownloader;
