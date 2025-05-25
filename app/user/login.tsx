import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Alert, ActivityIndicator, Image, ImageStyle, ViewStyle, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (auth) {
      setFirebaseReady(true);
    } else {
      setFirebaseReady(false);
    }
  }, []);

  const handleLogin = async () => {
    if (!firebaseReady) {
      Alert.alert('Hata', 'Firebase henüz hazır değil. Lütfen tekrar deneyin.');
      return;
    }
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin!');
      return;
    }
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      if (!userDoc.exists() || userData?.userType !== 'user') {
        await auth.signOut();
        Alert.alert('Hata', 'Bu hesap kullanıcı hesabı değil!');
        return;
      }
      router.replace('/user/dashboard');
    } catch (error: any) {
      let errorMessage = 'Giriş yapılırken bir hata oluştu!';
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential': errorMessage = 'E-posta veya şifre hatalı!'; break;
          case 'auth/too-many-requests': errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.'; break;
          case 'auth/user-not-found': errorMessage = 'Kullanıcı bulunamadı!'; break;
          case 'auth/wrong-password': errorMessage = 'Hatalı şifre!'; break;
          case 'auth/network-request-failed': errorMessage = 'İnternet bağlantısı hatası! Lütfen bağlantınızı kontrol edin.'; break;
          case 'auth/invalid-email': errorMessage = 'Geçersiz e-posta adresi!'; break;
          default: errorMessage = `Hata: ${error.message || error.code}`;
        }
      }
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
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
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="E-posta adresi"
              placeholderTextColor={theme.colors.gray[500]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor={theme.colors.gray[500]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button
              title={loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              variant="primary"
              size="large"
              fullWidth
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            />
            <Button
              title="Kayıt Ol"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => router.push('/user/register')}
              style={styles.button}
            />
            <View style={styles.forgotContainer}>
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <Text style={styles.forgotText} onPress={() => router.push('/user/forgot-password')}>
                  Şifremi Unuttum
                </Text>
              </View>
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
  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  input: {
    backgroundColor: theme.colors.background.light,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  button: {
    marginTop: 4,
  },
  forgotContainer: {
    width: '100%',
    alignItems: 'center',
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 8,
    fontWeight: '500',
  },
}); 