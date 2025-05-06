// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import apiClient from '../api/apiClient';

// Define the type for auth state
interface AuthState {
  token: string | null;
  role: string | null;
  isLoading: boolean;
}

// Define the type for the context
interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string, deviceToken: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create context with default values
const defaultContext: AuthContextType = {
  authState: { token: null, role: null, isLoading: true },
  login: async () => ({ success: false, error: 'Not implemented' }),
  logout: async () => {},
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    role: null,
    isLoading: true,
  });
  
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadToken();
  }, []);

  // This useEffect handles navigation based on auth state
  useEffect(() => {
    // Don't do anything while still loading
    if (authState.isLoading) return;
    
    const inAuthGroup = segments[0] === 'auth';
    const isIndexRoute = (segments.length as number) === 0 || segments[0] === undefined;
    
    if (!authState.token) {
      if (!inAuthGroup && !isIndexRoute) {
        router.replace('/');
      }
    } else {
      if (inAuthGroup || isIndexRoute) {
        redirectBasedOnRole(authState.role);
      }
    }
  }, [authState.isLoading, authState.token, authState.role, segments]);

  // Helper function to redirect based on role
  const redirectBasedOnRole = (role: string | null) => {
    if (role === 'admin') {
      router.replace('/admin/admin_home');
    } else if (role === 'teacher') {
      router.replace('/teacher/teacher_home');
    } else if (role === 'parent') {
      router.replace('/parent/parent_home');
    }
  };

  const loadToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');
      
      if (token) {
        // Validate token with your backend if needed
        setAuthState({
          token,
          role,
          isLoading: false,
        });
        
      } else {
        setAuthState({
          token: null,
          role: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to load authentication token', error);
      setAuthState({
        token: null,
        role: null,
        isLoading: false,
      });
    }
  };

  const login = async (username: string, password: string, deviceToken: string) => {
    try {
      const response = await apiClient.post('/auth/login', { 
        username, 
        password,
        deviceToken
      });
      
      const { token, role } = response.data;
      
      // Store both token and role
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userRole', role);
      
      // Update auth state which will trigger navigation in useEffect
      setAuthState({
        token,
        role,
        isLoading: false,
      });       
     
      redirectBasedOnRole(role);
      
      return { success: true, role };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Incorrect username or password' };
    }
  };
  
  const logout = async () => {
    try {
      // Clear authentication data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      
      setAuthState({
        token: null,
        role: null,
        isLoading: false,
      });
      
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        authState,  
        login, 
        logout,
        isAuthenticated: !!authState.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook with proper typing
export const useAuth = () => useContext(AuthContext);
