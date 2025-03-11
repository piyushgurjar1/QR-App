import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import axios from 'axios';

// Regex patterns for validation
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^[0-9]{10}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function RegisterScreen() {
  const router = useRouter();
  
  // New state variables for fields
  const [parentMail, setParentMail] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle the registration
  const handleRegister = async () => {
    // Basic validation for the fields
    // if (!username || username.length < 3) {
    //   Alert.alert('Validation Error', 'Username must be at least 3 characters long.');
    //   return;
    // }
    // if (!childFirstName || childFirstName.length < 2) {
    //   Alert.alert('Validation Error', 'Child first name must be at least 2 characters long.');
    //   return;
    // }
    // if (!childLastName || childLastName.length < 2) {
    //   Alert.alert('Validation Error', 'Child last name must be at least 2 characters long.');
    //   return;
    // }
    // if (!parentMail || !emailPattern.test(parentMail)) {
    //   Alert.alert('Validation Error', 'Please enter a valid parent email address.');
    //   return;
    // }
    // if (!phonePattern.test(parentContact)) {
    //   Alert.alert('Validation Error', 'Please enter a valid contact number (10 digits).');
    //   return;
    // }
    // if (!password || !passwordPattern.test(password)) {
    //   Alert.alert(
    //     'Validation Error',
    //     'Password must be at least 8 characters long, contain a lowercase letter, a number, and a special character.'
    //   );
    //   return;
    // }
    // if (password !== confirmPassword) {
    //   Alert.alert('Validation Error', 'Password and Confirm Password must match.');
    //   return;
    // }

    console.log('Register with:', { parentMail, parentContact, childFirstName, childLastName, username, password });

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        parent_mail: parentMail,
        parent_contact: parentContact,
        child_first_name: childFirstName,
        child_last_name: childLastName,
        username : username,
        password : password,
        confirm_password : confirmPassword
      });
      console.log(response.data);
      Alert.alert('Registration Successful', 'Please log in with your new account.');
      router.push('/auth/login');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred during registration.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Child First Name"
        value={childFirstName}
        onChangeText={setChildFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Child Last Name"
        value={childLastName}
        onChangeText={setChildLastName}
      />

      <TextInput
        style={styles.input}
        placeholder="Parent Email"
        value={parentMail}
        onChangeText={setParentMail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Parent Contact Number"
        value={parentContact}
        onChangeText={setParentContact}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>

      <Link href="/" style={styles.link}>
        Back to Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
  },
});
