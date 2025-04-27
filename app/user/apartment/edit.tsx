import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Apartment {
  id: string;
  block: string;
  number: string;
  floor: string;
  owner: string;
  phone: string;
  email: string;
}

export default function EditApartment() {
  const [apartment, setApartment] = useState<Apartment>({
    id: '',
    block: '',
    number: '',
    floor: '',
    owner: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApartmentData();
  }, []);

  const fetchApartmentData = async () => {
    try {
      const apartmentRef = doc(db, 'apartments', 'current-user-id'); // Gerçek kullanıcı ID'si ile değiştirilecek
      const apartmentDoc = await getDoc(apartmentRef);
      
      if (apartmentDoc.exists()) {
        setApartment({
          id: apartmentDoc.id,
          ...apartmentDoc.data()
        } as Apartment);
      }
    } catch (error) {
      console.error('Daire bilgileri yüklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Daire bilgileri yüklenirken bir hata oluştu.');
    }
  };

  const handleSave = async () => {
    if (!apartment.block || !apartment.number || !apartment.floor || !apartment.owner || !apartment.phone || !apartment.email) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
      return;
    }

    try {
      setLoading(true);
      const apartmentRef = doc(db, 'apartments', apartment.id);
      await updateDoc(apartmentRef, {
        block: apartment.block.trim(),
        number: apartment.number.trim(),
        floor: apartment.floor.trim(),
        owner: apartment.owner.trim(),
        phone: apartment.phone.trim(),
        email: apartment.email.trim(),
      });
      
      Alert.alert('Başarılı', 'Daire bilgileri başarıyla güncellendi.');
      router.back();
    } catch (error) {
      console.error('Daire bilgileri güncellenirken hata oluştu:', error);
      Alert.alert('Hata', 'Daire bilgileri güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.headerTitle}>Daire Bilgilerini Düzenle</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}>
            <Text style={styles.saveButtonText}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Blok</Text>
            <TextInput
              style={styles.input}
              value={apartment.block}
              onChangeText={(text) => setApartment({ ...apartment, block: text })}
              placeholder="Blok numarası"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Daire No</Text>
            <TextInput
              style={styles.input}
              value={apartment.number}
              onChangeText={(text) => setApartment({ ...apartment, number: text })}
              placeholder="Daire numarası"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kat</Text>
            <TextInput
              style={styles.input}
              value={apartment.floor}
              onChangeText={(text) => setApartment({ ...apartment, floor: text })}
              placeholder="Kat numarası"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Daire Sahibi</Text>
            <TextInput
              style={styles.input}
              value={apartment.owner}
              onChangeText={(text) => setApartment({ ...apartment, owner: text })}
              placeholder="Daire sahibinin adı"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={apartment.phone}
              onChangeText={(text) => setApartment({ ...apartment, phone: text })}
              placeholder="Telefon numarası"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={apartment.email}
              onChangeText={(text) => setApartment({ ...apartment, email: text })}
              placeholder="E-posta adresi"
              keyboardType="email-address"
              autoCapitalize="none"
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
}); 