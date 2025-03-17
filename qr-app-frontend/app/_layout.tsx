import { Stack } from 'expo-router';
export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
      <Stack.Screen name="auth/register" options={{ title: 'Register' }} />
      <Stack.Screen name="admin/admin_home" options={{ title: 'AdminHome' }} /> 
      <Stack.Screen name="parent/parent_home" options={{ title: 'Parent Home' }} /> 
      <Stack.Screen name="careTaker/careTaker_home" options={{ title: 'CareTakerHome' }} /> 
      <Stack.Screen name="careTaker/scanner" options={{ title: 'CareTakerScanner' }} />
    </Stack>
  );
}
