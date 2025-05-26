import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { db } from '../../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddCommonArea() {
  const [name, setName] = useState('');
  const [type, setType] = useState<'spor' | 'havuz' | 'hamam' | 'diğer'>('spor');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddArea = async () => {
    if (!name.trim() || !capacity.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const capacityNumber = parseInt(capacity);
    if (isNaN(capacityNumber) || capacityNumber <= 0) {
      Alert.alert('Hata', 'Geçerli bir kapasite girin.');
      return;
    }

    setLoading(true);
    try {
      const areasRef = collection(db, 'commonAreas');
      await addDoc(areasRef, {
        name: name.trim(),
        type,
        capacity: capacityNumber,
        isActive: true,
        currentBookings: 0,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Başarılı', 'Ortak alan başarıyla eklendi.');
      router.back();
    } catch (error) {
      console.error('Ortak alan eklenirken hata:', error);
      Alert.alert('Hata', 'Ortak alan eklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Ortak Alan</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.label}>Alan Adı:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Örn: Spor Salonu"
            />

            <Text style={styles.label}>Alan Tipi:</Text>
            <View style={styles.typeContainer}>
              {['spor', 'havuz', 'hamam', 'diğer'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeButton,
                    type === t && styles.selectedTypeButton,
                  ]}
                  onPress={() => setType(t as any)}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === t && styles.selectedTypeButtonText,
                    ]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Kapasite:</Text>
            <TextInput
              style={styles.input}
              value={capacity}
              onChangeText={setCapacity}
              placeholder="Örn: 10"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleAddArea}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Ortak Alan Ekle</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedTypeButton: {
    backgroundColor: theme.colors.primary,
  },
  typeButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 