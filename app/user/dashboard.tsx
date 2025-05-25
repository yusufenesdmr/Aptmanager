import * as React from 'react';
import { StyleSheet, View, Image, ImageStyle, ViewStyle, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';

export default function UserDashboard() {
  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../assets/images/logo1.jpg')} style={styles.logoImage} resizeMode="cover" />
            </View>
          </View>
          
          <View style={styles.row}>
            <Button
              title="🏢 Daire Bilgileri"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => handleNavigation('/user/apartment/info')}
              style={styles.gridButton}
            />
            <Button
              title="💸 Aidat Ödemeleri"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => handleNavigation('/user/dues/payments')}
              style={styles.gridButton}
            />
          </View>
          <View style={styles.row}>
            <Button
              title="⚠️ Şikayetler"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => handleNavigation('/user/complaints')}
              style={styles.gridButton}
            />
            <Button
              title="💬 Mesajlar"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => handleNavigation('/user/chat')}
              style={styles.gridButton}
            />
          </View>
          <View style={styles.row}>
            <Button
              title="📢 Duyurular"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => handleNavigation('/user/announcements/list')}
              style={styles.gridButton}
            />
            <Button
              title="☁️ Hava Durumu"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => handleNavigation('/user/weather/forecast')}
              style={styles.gridButton}
            />
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
    marginBottom: 16,
  },
  gridButton: {
    flex: 1,
    marginHorizontal: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 