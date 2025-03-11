import { Stack } from 'expo-router';
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
      <Stack.Screen name="auth/register" options={{ title: 'Register' }} />

      <Stack.Screen name="teacher/teacher_home" options={{ title: 'TeacherHome' }} /> 
      <Stack.Screen name="teacher/scanner" options={{ title: 'TeacherScanner' }} />
    </Stack>
  );
}