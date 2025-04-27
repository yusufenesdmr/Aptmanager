import { Stack } from 'expo-router';

export default function UserApartmentLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Daire Bilgileri',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Daire Bilgilerini Düzenle',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="info"
        options={{
          title: 'Daire Detayları',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 