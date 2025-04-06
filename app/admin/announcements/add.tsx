import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export default function AddAnnouncement() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddAnnouncement = async (): Promise<void> => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve içerik girin!');
      return;
    }

    try {
      setLoading(true);
      console.log('Duyuru ekleme işlemi başlatılıyor...');
      console.log('Firebase bağlantısı kontrol ediliyor...');
      
      if (!db) {
        console.error('Firestore bağlantısı bulunamadı!');
        throw new Error('Firestore bağlantısı bulunamadı!');
      }

      console.log('Firestore bağlantısı başarılı');
      const announcementsRef = collection(db, 'announcements');
      console.log('Koleksiyon referansı alındı:', announcementsRef.path);
      
      const newAnnouncement = {
        title: title.trim(),
        content: content.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      console.log('Eklenecek duyuru verisi:', newAnnouncement);

      console.log('Firestore\'a yazma işlemi başlatılıyor...');
      const docRef = await addDoc(announcementsRef, newAnnouncement);
      console.log('Duyuru başarıyla eklendi. Belge ID:', docRef.id);
      
      Alert.alert(
        'Başarılı',
        'Duyuru başarıyla eklendi!',
        [
          {
            text: 'Tamam',
            onPress: () => {
              console.log('Kullanıcı ana sayfaya yönlendiriliyor...');
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Duyuru ekleme hatası - Detaylı hata:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      let errorMessage = 'Duyuru eklenirken bir hata oluştu!';
      
      if (error.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
            break;
          case 'unavailable':
            errorMessage = 'Firebase servisi şu anda kullanılamıyor.';
            break;
          case 'not-found':
            errorMessage = 'Koleksiyon bulunamadı. Lütfen Firebase Console\'dan kontrol edin.';
            break;
          default:
            errorMessage = `Hata: ${error.message || error.code}`;
        }
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#ffffff', '#f5f5f5', '#f0f0f0']}
          style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#4c669f" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Yeni Duyuru Ekle</Text>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Başlık</Text>
              <TextInput
                style={styles.input}
                placeholder="Duyuru başlığı"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              <Text style={styles.label}>İçerik</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Duyuru içeriği"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
                maxLength={1000}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAddAnnouncement}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Ekleniyor...' : 'Duyuru Ekle'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4c669f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 