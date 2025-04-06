import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Firebase'in hazır olduğundan emin ol
    if (auth) {
      setFirebaseReady(true);
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
      console.log('Giriş başarılı:', userCredential.user);
      router.replace('/user/dashboard');
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      let errorMessage = 'Giriş yapılırken bir hata oluştu!';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'E-posta veya şifre hatalı!';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Kullanıcı bulunamadı!';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Hatalı şifre!';
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f5f5f5', '#f0f0f0']}
        style={styles.gradient}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: '#333' }]}>Kullanıcı Girişi</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#333' }]}>E-posta</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' }]}
              placeholder="E-posta adresi"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: '#333' }]}>Şifre</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' }]}
              placeholder="Şifre"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled, { backgroundColor: '#4c669f' }]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: '#f0f0f0' }]}
            onPress={() => router.push('/user/register')}>
            <Text style={[styles.registerButtonText, { color: '#4c669f' }]}>Hesabınız yok mu? Kayıt olun</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: '#4c669f' }]}>Geri Dön</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
}); 