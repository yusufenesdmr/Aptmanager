import { Stack } from 'expo-router';

export default function ApartmentLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="list"
        options={{
          title: 'Daire Yönetimi',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Yeni Daire Ekle',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 