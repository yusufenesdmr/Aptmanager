import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';

export default function UserSettings() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState(auth.currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
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
        setPhone(data.phone || '');
      } else {
        console.log('Kullanıcı belgesi bulunamadı');
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı.');
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
        phone: phone.trim(),
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
      Alert.alert('Hata', 'Şifre sıfırlama bağlantısı gönderilirken bir sorun oluştu.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
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
            editable={false}
          />

          <Text style={styles.label}>Telefon:</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Telefon numaranızı girin"
            keyboardType="phone-pad"
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