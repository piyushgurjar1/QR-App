import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router'; // Import the useRouter hook

export default function TeacherHomeScreen() {
  const router = useRouter(); // Use router to navigate between pages

  const handleLogout = () => {
    // Implement logout logic if needed (e.g., clear auth tokens, etc.)
    router.push('/'); // Redirect to the login screen (or home screen)
  };

  const handleScanRedirect = () => {
    // Redirect to the scanner page
    router.push('/teacher/scanner');
  };

  return (
    <View style={styles.container}>
      {/* Scan Button */}
      <Pressable style={styles.scanButton} onPress={handleScanRedirect}>
        <Text style={styles.scanButtonText}>Scan</Text>
      </Pressable>

      <Text style={styles.title}>Admin Dashboard</Text>

      {/* Admin Dashboard content */}
      <View style={styles.contentContainer}>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Manage Users</Text>
        </Pressable>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>View Reports</Text>
        </Pressable>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Settings</Text>
        </Pressable>
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  contentContainer: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    backgroundColor: '#34C759', // Green color for scan button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
