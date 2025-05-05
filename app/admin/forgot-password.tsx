import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen email adresinizi girin!');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı email adresinize gönderildi.');
      router.back();
    } catch (error: any) {
      let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'Bu email adresi ile kayıtlı yönetici bulunamadı.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Geçersiz email adresi.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.';
            break;
        }
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yönetici Şifremi Unuttum</Text>
      <Text style={styles.description}>
        Yönetici email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Yönetici email adresiniz"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleResetPassword}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Şifre Sıfırlama Bağlantısı Gönder</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>Geri Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
  },
}); 