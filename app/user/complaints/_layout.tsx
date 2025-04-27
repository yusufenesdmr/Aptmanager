import { Stack } from 'expo-router';

export default function ComplaintsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Şikayetlerim',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Yeni Şikayet',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 