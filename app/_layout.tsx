import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, Slot, usePathname } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  // Giriş yapılmamışsa buton görünmesin
  // Ayrıca yardım merkezi sayfasında, login sayfalarında ve ana sayfada tekrar buton gösterme
  const showChatbot = isLoggedIn && pathname !== '/' && pathname !== '/user/help-center' && pathname !== '/admin/help-center' && pathname !== '/user/login' && pathname !== '/admin/login';

  return (
    <>
      <Slot />
      {showChatbot && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 24,
            bottom: 32,
            backgroundColor: '#000',
            borderRadius: 32,
            padding: 16,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            zIndex: 999,
          }}
          onPress={() => {
            if (pathname.startsWith('/admin')) {
              router.push('/admin/help-center' as any);
            } else {
              router.push('/user/help-center');
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="help-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </>
  );
}
