import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="user" />
        <Stack.Screen name="admin/login" />
        <Stack.Screen name="admin/register" />
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="admin/apartment/add" />
        <Stack.Screen name="admin/apartment/list" />
        <Stack.Screen name="admin/user/add" />
        <Stack.Screen name="admin/user/list" />
        <Stack.Screen name="admin/dues/add" />
        <Stack.Screen name="admin/dues/list" />
        <Stack.Screen name="admin/weather" />
        <Stack.Screen name="admin/complaints/list" />
        <Stack.Screen name="user/login" />
        <Stack.Screen name="user/register" />
        <Stack.Screen name="user/dashboard" />
        <Stack.Screen name="user/apartment/index" />
        <Stack.Screen name="user/apartment/edit" />
        <Stack.Screen name="user/apartment/info" />
        <Stack.Screen name="user/dues/payments" />
        <Stack.Screen name="user/announcements/list" />
        <Stack.Screen name="user/complaints/index" />
        <Stack.Screen name="user/complaints/add" />
        <Stack.Screen name="user/weather/forecast" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
