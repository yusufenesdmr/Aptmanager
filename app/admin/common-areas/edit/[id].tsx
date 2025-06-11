import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { db } from '../../../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface CommonArea {
  id: string;
  name: string;
  type: 'spor' | 'havuz' | 'hamam' | 'diğer';
  capacity: number;
  isActive: boolean;
  currentBookings: number;
}

export default function EditCommonArea() {
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [type, setType] = useState<'spor' | 'havuz' | 'hamam' | 'diğer'>('spor');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArea();
  }, [id]);

  const fetchArea = async () => {
    try {
      const areaRef = doc(db, 'commonAreas', id as string);
      const areaDoc = await getDoc(areaRef);
      
      if (!areaDoc.exists()) {
        Alert.alert('Hata', 'Ortak alan bulunamadı.');
        router.back();
        return;
      }

      const areaData = areaDoc.data() as CommonArea;
      setName(areaData.name);
      setType(areaData.type);
      setCapacity(areaData.capacity.toString());
    } catch (error) {
      console.error('Ortak alan bilgileri yüklenirken hata:', error);
      Alert.alert('Hata', 'Ortak alan bilgileri yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim() || !capacity.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const capacityNumber = parseInt(capacity);
    if (isNaN(capacityNumber) || capacityNumber <= 0) {
      Alert.alert('Hata', 'Geçerli bir kapasite girin.');
      return;
    }

    setSaving(true);
    try {
      const areaRef = doc(db, 'commonAreas', id as string);
      await updateDoc(areaRef, {
        name: name.trim(),
        type,
        capacity: capacityNumber,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Başarılı', 'Ortak alan başarıyla güncellendi.');
      router.back();
    } catch (error) {
      console.error('Ortak alan güncellenirken hata:', error);
      Alert.alert('Hata', 'Ortak alan güncellenirken bir sorun oluştu.');
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ortak Alan Düzenle</Text>
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
              onPress={handleUpdate}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Güncelle</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: theme.colors.primary,
  },
  typeButtonText: {
    color: '#666',
    fontSize: 14,
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 