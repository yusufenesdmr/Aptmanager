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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.weatherIcon}
            onPress={() => handleNavigation('/user/weather/forecast')}>
            <Ionicons name="partly-sunny" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerPlaceholder} />
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleNavigation('/user/chat')}>
              <Ionicons name="chatbubbles" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleNavigation('/user/settings')}>
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
              title="📢 Duyurular"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => handleNavigation('/user/announcements')}
              style={styles.gridButton}
            />
          </View>
          <View style={styles.row}>
            <Button
              title="📊 Anketler"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => handleNavigation('/user/surveys')}
              style={styles.gridButton}
            />
          </View>
          <View style={styles.row}>
            <Button
              title="🏊‍♂️ Ortak Alanlar"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => handleNavigation('/user/common-areas')}
              style={styles.gridButton}
            />
          </View>
          <View style={styles.menuRow}>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridButton: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  helpCenterButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    },
  helpCenterButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
  },
  menuButtonText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weatherIcon: {
    padding: 8,
  },
}); 