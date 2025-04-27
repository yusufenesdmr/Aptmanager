import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  date: string;
}

export default function EditAnnouncement() {
  const { id } = useLocalSearchParams();
  const [announcement, setAnnouncement] = useState<Announcement>({
    id: '',
    title: '',
    content: '',
    isImportant: false,
    date: '',
  });

  useEffect(() => {
    // Burada API'den duyuru detaylarını çekebilirsiniz
    // Şimdilik örnek veri kullanıyoruz
    const fetchAnnouncement = () => {
      const sampleAnnouncement: Announcement = {
        id: id as string,
        title: 'Aidat Ödemeleri Hakkında',
        content: 'Bu ayki aidat ödemeleri 15 Mart tarihine kadar yapılacaktır.',
        isImportant: true,
        date: '2024-03-01',
      };
      setAnnouncement(sampleAnnouncement);
    };

    fetchAnnouncement();
  }, [id]);

  const handleSave = () => {
    // Burada API çağrısı yapılacak
    console.log('Duyuru kaydedildi:', announcement);
    router.back();
  };

  return (
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
          <Text style={styles.headerTitle}>Duyuru Düzenle</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Başlık</Text>
            <TextInput
              style={styles.input}
              value={announcement.title}
              onChangeText={(text) => setAnnouncement({ ...announcement, title: text })}
              placeholder="Duyuru başlığı"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>İçerik</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={announcement.content}
              onChangeText={(text) => setAnnouncement({ ...announcement, content: text })}
              placeholder="Duyuru içeriği"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAnnouncement({ ...announcement, isImportant: !announcement.isImportant })}>
            <View style={[styles.checkbox, announcement.isImportant && styles.checkboxChecked]}>
              {announcement.isImportant && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Önemli Duyuru</Text>
          </TouchableOpacity>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4c669f',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4c669f',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4c669f',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
}); 