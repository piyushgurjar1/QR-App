import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from './auth/AuthContext';
import { Alert } from 'react-native';
import RemotePushController from './notification/notification';
import 'expo-dev-client'; 
export default function Layout() {
 
  return (
    <AuthProvider>
      <RemotePushController />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
          <Stack.Screen name="auth/register" options={{ title: 'Register' }} />
          <Stack.Screen name="admin/admin_home" options={{ title: 'AdminHome' }} />
          <Stack.Screen name="parent/parent_home" options={{ title: 'Parent Home' }} />
          <Stack.Screen name="careTaker/careTaker_home" options={{ title: 'CareTakerHome' }} />
          <Stack.Screen name="careTaker/scanner" options={{ title: 'CareTakerScanner' }} />
        </Stack>
    </AuthProvider>
  );
}
