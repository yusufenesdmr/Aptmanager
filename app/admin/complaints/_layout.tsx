import { Stack } from 'expo-router';

export default function AdminComplaintsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="list"
        options={{
          title: 'Şikayet Yönetimi',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 