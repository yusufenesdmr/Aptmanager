import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';

interface NewAnnouncement {
  title: string;
  content: string;
  isImportant: boolean;
}

export default function AddAnnouncement() {
  const [announcement, setAnnouncement] = useState<NewAnnouncement>({
    title: '',
    content: '',
    isImportant: false,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddAnnouncement = async (): Promise<void> => {
    if (!announcement.title.trim() || !announcement.content.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve içerik girin!');
      return;
    }

    try {
      setLoading(true);
      
      if (!db) {
        console.error('Firestore bağlantısı bulunamadı!');
        throw new Error('Firestore bağlantısı bulunamadı!');
      }

      const announcementsRef = collection(db, 'announcements');
      
      const newAnnouncement = {
        title: announcement.title.trim(),
        content: announcement.content.trim(),
        isImportant: announcement.isImportant,
        date: serverTimestamp()
      };

      await addDoc(announcementsRef, newAnnouncement);
      
      Alert.alert(
        'Başarılı',
        'Duyuru başarıyla eklendi!',
        [
          {
            text: 'Tamam',
            onPress: () => {
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
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Image source={require('../../../assets/images/logo1.jpg')} style={styles.logoImage} resizeMode="cover" />
              </View>
            </View>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Yeni Duyuru Ekle</Text>
              <Text style={styles.label}>Başlık</Text>
              <TextInput
                style={styles.input}
                placeholder="Duyuru başlığı"
                placeholderTextColor={theme.colors.gray[400]}
                value={announcement.title}
                onChangeText={(text) => setAnnouncement({ ...announcement, title: text })}
                maxLength={100}
              />

              <Text style={styles.label}>İçerik</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Duyuru içeriği"
                placeholderTextColor={theme.colors.gray[400]}
                value={announcement.content}
                onChangeText={(text) => setAnnouncement({ ...announcement, content: text })}
                multiline
                numberOfLines={8}
                maxLength={1000}
              />

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAnnouncement({ ...announcement, isImportant: !announcement.isImportant })}>
                <View style={[styles.checkbox, announcement.isImportant && styles.checkboxChecked]}>
                  {announcement.isImportant && (
                    <Ionicons name="checkmark" size={16} color={theme.colors.background.light} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Önemli Duyuru</Text>
              </TouchableOpacity>

              <Button
                title={loading ? 'Ekleniyor...' : 'Duyuru Ekle'}
                variant="primary"
                size="large"
                fullWidth
                onPress={handleAddAnnouncement}
                loading={loading}
                style={styles.saveButton}
              />
               <Button
                title="İptal"
                variant="outline"
                size="large"
                fullWidth
                onPress={() => router.back()}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.soft,
    marginBottom: 8,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    backgroundColor: theme.colors.background.light,
    borderRadius: 16,
    padding: 24,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.light,
    textAlign: 'center',
    marginBottom: 8,
  },
  label: {
    color: theme.colors.text.light,
    fontSize: 16,
    marginBottom: 2,
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.background.soft,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 4,
    color: theme.colors.text.light,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
   checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.soft,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: theme.colors.text.light,
  },
  saveButton: {
    marginTop: 8,
  },
}); 