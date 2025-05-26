import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme'; // Tema renklerini kullanmak için import
import { auth, db } from '../../config/firebase'; // Firebase import yolu düzeltildi
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore fonksiyonları
import { sendPasswordResetEmail } from 'firebase/auth'; // Auth fonksiyonları

export default function AdminSettings() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState(auth.currentUser?.email || ''); // E-posta değiştirilemez
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserName(data.name || '');
        // E-posta Firebase Auth'tan alınır ve sadece gösterilir.
      } else {
        console.log('Admin kullanıcı belgesi bulunamadı');
      }
    } catch (error) {
      console.error('Yönetici bilgileri alınırken hata:', error);
      Alert.alert('Hata', 'Yönetici bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !userName.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        name: userName.trim(),
      });
      Alert.alert('Başarılı', 'Profil bilgileri güncellendi.');
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Hata', 'Lütfen şifre sıfırlama için e-posta adresinizi girin.');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      setResetEmail('');
    } catch (error) {
      console.error('Şifre sıfırlama e-postası gönderilirken hata:', error);
      // Hata kodlarına göre daha spesifik mesajlar gösterilebilir
      Alert.alert('Hata', 'Şifre sıfırlama bağlantısı gönderilirken bir sorun oluştu.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      Alert.alert('Başarılı', 'Oturum kapatıldı.');
      router.replace('/');
    } catch (error) {
      console.error('Oturum kapatılırken hata:', error);
      Alert.alert('Hata', 'Oturum kapatılırken bir sorun oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Kişisel Bilgiler Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
          <Text style={styles.label}>Adınız:</Text>
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholder="Adınızı girin"
          />

          <Text style={styles.label}>E-posta:</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={userEmail}
            editable={false} // E-posta genellikle değiştirilemez
          />

          <TouchableOpacity style={styles.button} onPress={handleSaveProfile} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Şifre Sıfırlama Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şifre Sıfırlama</Text>
          
          <Text style={styles.label}>Kayıtlı E-posta Adresiniz:</Text>
          <TextInput
            style={styles.input}
            value={resetEmail}
            onChangeText={setResetEmail}
            placeholder="E-posta adresinizi girin"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handlePasswordReset} disabled={resetLoading}>
            {resetLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Şifre Sıfırlama Bağlantısı Gönder</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Oturumu Kapat Bölümü */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, styles.signOutButton]} 
            onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Oturumu Kapat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});