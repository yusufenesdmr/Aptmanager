import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ImageStyle, ViewStyle, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { auth, db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function AdminDashboard() {
  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', auth.currentUser?.uid),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    }, (error) => {
      console.error('Okunmamış mesaj sayısı alınırken hata:', error);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.weatherIcon} 
            onPress={() => handleNavigation('/admin/weather')}>
            <Ionicons name="partly-sunny" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerPlaceholder} />
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => handleNavigation('/admin/chat')} style={styles.chatIconContainer}>
              <Ionicons name="chatbubbles" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.unreadBadge} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigation('/admin/settings')}>
              <Ionicons name="settings" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../assets/images/logo1.jpg')} style={styles.logoImage} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.gridContainer}>
            <View style={styles.row}>
              <Button
                title="🏢 Daire Yönetimi"
                variant="primary"
                size="large"
                fullWidth
                onPress={() => handleNavigation('/admin/apartments/list')}
                style={styles.gridButton}
              />
              <Button
                title="💸 Aidat Yönetimi"
                variant="secondary"
                size="large"
                fullWidth
                onPress={() => handleNavigation('/admin/dues/list')}
                style={styles.gridButton}
              />
            </View>
            <View style={styles.row}>
              <Button
                title="📢 Duyuru Yönetimi"
                variant="primary"
                size="large"
                fullWidth
                onPress={() => handleNavigation('/admin/announcements/list')}
                style={styles.gridButton}
              />
              <Button
                title="⚠️ Şikayet Yönetimi"
                variant="secondary"
                size="large"
                fullWidth
                onPress={() => handleNavigation('/admin/complaints/list')}
                style={styles.gridButton}
              />
            </View>
            <View style={styles.row}>
              <Button
                title="🏊‍♂️ Ortak Alanlar"
                variant="primary"
                size="large"
                fullWidth
                onPress={() => handleNavigation('/admin/common-areas/list')}
                style={styles.gridButton}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 50,
  },
  headerPlaceholder: {
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  chatIconContainer: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 6,
    width: 12,
    height: 12,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.soft,
    marginBottom: 8,
  } as ViewStyle,
  logoImage: {
    width: 120,
    height: 120,
  } as ImageStyle,
  gridContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 0,
  },
  gridButton: {
    flex: 1,
    marginHorizontal: 0,
  },
  weatherIcon: {
    padding: 8,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 0,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 