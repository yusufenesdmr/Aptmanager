import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);

  const { oobCode: urlOobCode } = useLocalSearchParams<{ oobCode: string }>();

  useEffect(() => {
    if (urlOobCode) {
      setOobCode(urlOobCode);
    }
  }, [urlOobCode]);

  const handleResetPassword = async () => {
    if (!oobCode) {
      Alert.alert('Hata', 'Geçersiz sıfırlama bağlantısı.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen yeni şifrenizi girin ve onaylayın.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, newPassword);
      Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.');
      router.replace('/');
    } catch (error: any) {
      let errorMessage = 'Şifre sıfırlama işlemi başarısız oldu.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/expired-action-code':
            errorMessage = 'Şifre sıfırlama bağlantısının süresi dolmuş.';
            break;
          case 'auth/invalid-action-code':
            errorMessage = 'Geçersiz sıfırlama bağlantısı.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Şifre çok zayıf. Daha güçlü bir şifre seçin.';
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
      <Text style={styles.title}>Yeni Şifre Belirle</Text>
      <Text style={styles.description}>
        Lütfen yeni şifrenizi belirleyin.
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Yeni şifre"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Yeni şifre (tekrar)"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleResetPassword}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
        )}
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
}); 