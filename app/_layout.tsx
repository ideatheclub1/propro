import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CommentProvider } from '@/contexts/CommentContext';
import { UserProvider } from '@/contexts/UserContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <CommentProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="ProfileScreen" 
              options={{ 
                headerShown: false,
                presentation: 'card',
                gestureEnabled: true 
              }} 
            />
            <Stack.Screen name="host-registration" />
            <Stack.Screen name="conversation" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" backgroundColor="#1E1E1E" />
        </CommentProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}