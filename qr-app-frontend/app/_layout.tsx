import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from './auth/AuthContext';
import { Alert } from 'react-native';
import { useState, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import 'expo-dev-client'; 


//Create Android notification channel at startup
async function createAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    });
  }
}

//Request permissions & get token
async function registerForPushNotificationsAsync() {
  await createAndroidChannel(); // must do this before asking for token
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('Notification permissions not granted');
    return;
  }
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
  ).data;
  console.log('🎫 Expo Push Token:', token);
  // send this token to your backend…
}

export default function Layout() {
  useEffect(() => {
    // 3️⃣ Register token and channel once
    registerForPushNotificationsAsync();

    // 4️⃣ Override notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const trigger = notification.request.trigger;

        // 4a) If Android & remote push → schedule a local one
        if (Platform.OS === 'android' && trigger && 'remoteMessage' in trigger) {
          const remoteNotif = (trigger as any).remoteMessage.notification;
          await Notifications.scheduleNotificationAsync({
            content: {
              title: remoteNotif?.title     ?? notification.request.content.title,
              body:  remoteNotif?.body      ?? notification.request.content.body,
              data:  notification.request.content.data,
              sound: true,
            },
            trigger: null, // fire immediately
          });
          // suppress the original remote notification
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          };
        }

        // 4b) iOS or our own local-notification on Android
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        };
      },
    });
  }, []);
 
  return (
    <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
          <Stack.Screen name="auth/register" options={{ title: 'Register' }} />
          <Stack.Screen name="admin/admin_home" options={{ title: 'AdminHome' }} />
          <Stack.Screen name="parent/parent_home" options={{ title: 'Parent Home' }} />
          <Stack.Screen name="teacher/teacher_home" options={{ title: 'TeacerHome' }} />
          <Stack.Screen name="teacher/scanner" options={{ title: 'TeacherScanner' }} />
          <Stack.Screen name="admin/NotifyParentsScreen" options={{ title: 'Notify Parents' }} />
          <Stack.Screen name="admin/PresentStudentsScreen" options={{ title: 'Present Students' }} />
          <Stack.Screen name="admin/UserForm" options={{ title: 'Add User' }} />
          <Stack.Screen name="parent/AttendanceHistoryScreen" options={{ title: 'Attendance History' }} />
        </Stack>
    </AuthProvider>
  );
}
