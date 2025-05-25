import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';

export default function AddDues() {
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState('');

  const handleAdd = async () => {
    if (!amount || !month || !year) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const duesRef = collection(db, 'dues');
      const apartmentsRef = collection(db, 'apartments');
      const apartmentsSnapshot = await getDocs(apartmentsRef);
      const apartments = apartmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as { id: string; no: string }[];

      if (apartments.length === 0) {
        Alert.alert('Hata', 'Hiç daire bulunamadı!');
        return;
      }

      // Genel aidat kaydı oluştur
      const generalDue = {
        amount: parseFloat(amount),
        month,
        year,
        status: 'Beklemede',
        apartmentId: 'all',
        createdAt: new Date(),
        dueDate: new Date(dueDate) // Son ödeme tarihi
      };
      await addDoc(duesRef, generalDue);

      // Her daire için ayrı aidat kaydı oluştur
      const duesPromises = apartments.map(apartment => {
        if (!apartment.no) {
          console.warn(`Daire ID ${apartment.id} için numara bulunamadı`);
          return null;
        }
        return addDoc(duesRef, {
          amount: parseFloat(amount),
          month,
          year,
          status: 'Beklemede',
          apartmentId: apartment.id,
          apartmentNo: apartment.no,
          createdAt: new Date(),
          dueDate: new Date(dueDate) // Son ödeme tarihi
        });
      }).filter(Boolean);

      await Promise.all(duesPromises);
      Alert.alert('Başarılı', 'Aidat başarıyla eklendi.');
      router.back();
    } catch (error) {
      console.error('Aidat eklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Aidat eklenirken bir hata oluştu.');
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
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aidat Ekle</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Tüm Daireler İçin Aidat</Text>
            <TextInput
              style={styles.input}
              placeholder="Aidat Tutarı (TL)"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Ay (1-12)"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              keyboardType="numeric"
              value={month}
              onChangeText={setMonth}
            />
            <TextInput
              style={styles.input}
              placeholder="Yıl"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              keyboardType="numeric"
              value={year}
              onChangeText={setYear}
            />
            <TextInput
              style={styles.input}
              placeholder="Son Ödeme Tarihi (YYYY-MM-DD)"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={dueDate}
              onChangeText={setDueDate}
            />
            <Button
              title={loading ? 'Ekleniyor...' : 'Aidat Ekle'}
              variant="primary"
              size="large"
              fullWidth
              onPress={handleAdd}
              loading={loading}
              style={styles.addButton}
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
    color: '#000',
    fontSize: 16,
    marginBottom: 2,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 4,
    color: '#000',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.light,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 24,
    height: 24,
  },
  addButton: {
    marginTop: 16,
  },
}); 