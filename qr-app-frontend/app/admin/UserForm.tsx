import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import RegisterScreen from "../auth/register";
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

interface UserFormProps {
  onSubmit: (userData: UserData) => void;
  onCancel: () => void;
}

interface UserData {
  name?: string;
  email?: string;
  contact?: string;
  username: string;
  password: string;
  role: "admin" | "teacher" | "student";
  parentMail?: string;
  parentContact?: string;
  childFirstName?: string;
  childLastName?: string;
  confirmPassword?: string;
}

export default function UserForm({ onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    contact: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "teacher",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [caretakers, setCaretakers] = useState<any[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);


  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (formData.role !== "student") {
      if (!formData.name?.trim()) errors.name = "Name is required";
      if (!emailRegex.test(formData.email || ""))
        errors.email = "Valid email required";
      if (!phoneRegex.test(formData.contact || ""))
        errors.contact = "Valid 10-digit number required";
      if (!formData.username.trim()) errors.username = "Username required";
      if (formData.password.length < 6)
        errors.password = "Minimum 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleAddUser(formData);
    }
  };
  
  const handleAddUser = async (userData: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await apiClient.post('/admin/users', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });   
      setCaretakers(prev => [...prev, response.data]);
      setIsAddingUser(false);
      Alert.alert('Success', 'User added successfully');
    } catch (error : any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    }
  };


  const handleRoleChange = (role: "admin" | "teacher" | "student") => {
    setFormData((prev) => ({ ...prev, role }));
    if (role === "student") {
      setShowStudentModal(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          <Text style={styles.sectionLabel}>Select Role</Text>
          <RoleSelector
            currentRole={formData.role}
            onRoleChange={handleRoleChange}
          />

          {formData.role !== "student" && (
            <>
              <Text style={styles.sectionLabel}>Personal Information</Text>
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                placeholder="Full Name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
              />
              {formErrors.name && (
                <Text style={styles.errorText}>{formErrors.name}</Text>
              )}

              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                placeholder="Email Address"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {formErrors.email && (
                <Text style={styles.errorText}>{formErrors.email}</Text>
              )}

              <TextInput
                style={[styles.input, formErrors.contact && styles.inputError]}
                placeholder="Contact Number"
                value={formData.contact}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, contact: text }))
                }
                keyboardType="phone-pad"
              />
              {formErrors.contact && (
                <Text style={styles.errorText}>{formErrors.contact}</Text>
              )}

              <Text style={styles.sectionLabel}>Account Details</Text>
              <TextInput
                style={[styles.input, formErrors.username && styles.inputError]}
                placeholder="Username"
                value={formData.username}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, username: text }))
                }
                autoCapitalize="none"
              />
              {formErrors.username && (
                <Text style={styles.errorText}>{formErrors.username}</Text>
              )}

              <TextInput
                style={[styles.input, formErrors.password && styles.inputError]}
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                secureTextEntry
              />
              {formErrors.password && (
                <Text style={styles.errorText}>{formErrors.password}</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {formData.role !== "student" && (
        <View style={styles.fixedButton}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create User</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showStudentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStudentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Student Registration</Text>
              <TouchableOpacity onPress={() => setShowStudentModal(false)}>
                <MaterialIcons name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>
            <RegisterScreen
              onSubmit={(data) => {
                onSubmit({
                  ...data,
                  role: "student",
                });
                setShowStudentModal(false);
              }}
              onBack={() => setShowStudentModal(false)}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const RoleSelector = ({
  currentRole,
  onRoleChange,
}: {
  currentRole: string;
  onRoleChange: (role: "admin" | "teacher" | "student") => void;
}) => (
  <View style={styles.roleContainer}>
    {["admin", "teacher", "student"].map((role) => (
      <TouchableOpacity
        key={role}
        style={[styles.roleButton, currentRole === role && styles.selectedRole]}
        onPress={() => onRoleChange(role as any)}
      >
        <Text
          style={[
            styles.roleButtonText,
            currentRole === role && styles.selectedRoleText,
          ]}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 250, 240, 1.00)",
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2c3e50",
  },
  formContainer: {
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 16,
    marginTop: 24,
  },
  input: {
    backgroundColor: "white",
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#dfe6e9",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: "#e74c3c",
    borderWidth: 2,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginBottom: 12,
    paddingLeft: 8,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#dfe6e9",
    alignItems: "center",
    marginHorizontal: 4,
  },
  selectedRole: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  roleButtonText: {
    color: "#7f8c8d",
    fontWeight: "600",
  },
  selectedRoleText: {
    color: "white",
  },
  fixedButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 250, 240, 0.9)",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#dfe6e9",
  },
  submitButton: {
    backgroundColor: "#3498db",
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "95%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
  },
});
