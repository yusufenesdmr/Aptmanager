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
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="admin/login" options={{ headerShown: false }} />
        <Stack.Screen name="admin/register" options={{ headerShown: false }} />
        <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="admin/apartment/add" options={{ headerShown: false }} />
        <Stack.Screen name="admin/apartment/list" options={{ headerShown: false }} />
        <Stack.Screen name="admin/user/add" options={{ headerShown: false }} />
        <Stack.Screen name="admin/user/list" options={{ headerShown: false }} />
        <Stack.Screen name="admin/dues/add" options={{ headerShown: false }} />
        <Stack.Screen name="admin/dues/list" options={{ headerShown: false }} />
        <Stack.Screen name="admin/weather" options={{ headerShown: false }} />
        <Stack.Screen name="user/login" options={{ headerShown: false }} />
        <Stack.Screen name="user/register" options={{ headerShown: false }} />
        <Stack.Screen name="user/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="user/apartment/info" options={{ headerShown: false }} />
        <Stack.Screen name="user/dues/payments" options={{ headerShown: false }} />
        <Stack.Screen name="user/announcements/list" options={{ headerShown: false }} />
        <Stack.Screen name="user/weather/forecast" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
