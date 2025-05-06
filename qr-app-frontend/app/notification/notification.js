import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Manually display the notification for Android - till foreground issue is resolved

    const isManualAndroidNotification = Platform.OS === 'android' && !notification.request.trigger;
    if (Platform.OS === 'android' && notification.request.trigger) {
      const appNotification = notification.request.trigger['remoteMessage'].notification;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: appNotification?.title || '',
          body: appNotification?.body || '',
          sound: true,
        },
        trigger: null,
      });
    }

    return {
      shouldShowAlert: Platform.OS === 'ios' || isManualAndroidNotification,
      shouldPlaySound: Platform.OS === 'ios' || isManualAndroidNotification,
      shouldSetBadge: false,
    };
  },
});