import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  date: any;
}

export default function EditAnnouncement() {
  const { id } = useLocalSearchParams();
  const [announcement, setAnnouncement] = useState<Announcement>({
    id: '',
    title: '',
    content: '',
    isImportant: false,
    date: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const docRef = doc(db, 'announcements', id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setAnnouncement({
            id: docSnap.id,
            ...docSnap.data(),
          } as Announcement);
        } else {
          Alert.alert('Hata', 'Duyuru bulunamadı.');
          router.back();
        }
      } catch (error) {
        console.error('Duyuru yüklenirken hata:', error);
        Alert.alert('Hata', 'Duyuru yüklenirken bir sorun oluştu.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleSave = async () => {
    if (!announcement.title.trim() || !announcement.content.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve içerik girin!');
      return;
    }

    try {
      setSaving(true);
      const docRef = doc(db, 'announcements', id as string);
      await updateDoc(docRef, {
        title: announcement.title.trim(),
        content: announcement.content.trim(),
        isImportant: announcement.isImportant,
        updatedAt: serverTimestamp()
      });
      
      Alert.alert('Başarılı', 'Duyuru başarıyla güncellendi.');
      router.back();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      Alert.alert('Hata', 'Duyuru güncellenirken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../../../assets/images/logo1.jpg')} style={styles.logoImage} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Duyuru Düzenle</Text>
            
            <Text style={styles.label}>Başlık</Text>
            <TextInput
              style={styles.input}
              value={announcement.title}
              onChangeText={(text) => setAnnouncement({ ...announcement, title: text })}
              placeholder="Duyuru başlığı"
              placeholderTextColor={theme.colors.gray[400]}
            />

            <Text style={styles.label}>İçerik</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={announcement.content}
              onChangeText={(text) => setAnnouncement({ ...announcement, content: text })}
              placeholder="Duyuru içeriği"
              placeholderTextColor={theme.colors.gray[400]}
              multiline
              numberOfLines={8}
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
              title={saving ? 'Kaydediliyor...' : 'Kaydet'}
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSave}
              loading={saving}
              style={styles.saveButton}
            />
            <Button
              title="İptal"
              variant="outline"
              size="large"
              fullWidth
              onPress={() => router.back()}
              style={styles.cancelButton}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light,
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
  cancelButton: {
    marginTop: 8,
  },
}); 