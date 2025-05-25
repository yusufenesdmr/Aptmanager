import React from 'react';
import { StyleSheet, View, StatusBar, ViewStyle, TextStyle, Image, ImageStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';

const App: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image source={require('../assets/images/logo1.jpg')} style={styles.logoImage} resizeMode="cover" />
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="👤 Yönetici Girişi"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => router.push('/admin/login')}
              style={styles.button}
            />
            
            <Button
              title="👥 Kullanıcı Girişi"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => router.push('/user/login')}
              style={styles.button}
            />
          </View>
        </View>
      </LinearGradient>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  gradient: {
    flex: 1,
  } as ViewStyle,
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  } as ViewStyle,
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  } as ViewStyle,
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background.soft,
  } as ViewStyle,
  logoImage: {
    width: 160,
    height: 160,
  } as ImageStyle,
  title: {
    ...theme.typography.h1,
    color: theme.colors.background.light,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  } as TextStyle,
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  } as ViewStyle,
  subtitle: {
    ...theme.typography.h3,
    color: theme.colors.background.light,
  } as TextStyle,
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  } as ViewStyle,
  button: {
    ...theme.shadows.md,
  } as ViewStyle,
});

export default App; 