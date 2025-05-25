import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { theme } from '@/constants/theme';
import { getAuth } from 'firebase/auth';

interface Apartment {
  id: string;
  block: string;
  no: string;
  floor: string;
  owner: string;
  phone: string;
  email: string;
  userId: string;
}

export default function ApartmentInfo() {
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApartmentData();
  }, []);

  const fetchApartmentData = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user?.email) {
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı!');
        setLoading(false);
        return;
      }

      const apartmentsRef = collection(db, 'apartments');
      const q = query(apartmentsRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const apartmentData = querySnapshot.docs[0].data() as Apartment;
        console.log('Daire verisi:', apartmentData);
        setApartment({ ...apartmentData, id: querySnapshot.docs[0].id });
      } else {
        Alert.alert('Bilgi', 'Henüz size atanmış bir daire bulunmuyor.');
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daire Bilgileri</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/logo1.jpg')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : apartment ? (
          <View style={styles.apartmentInfo}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Daire Bilgileri</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Blok</Text>
                <Text style={styles.infoValue}>{apartment.block}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Daire No</Text>
                <Text style={styles.infoValue}>{apartment.no}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kat</Text>
                <Text style={styles.infoValue}>{apartment.floor}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Daire Sahibi</Text>
                <Text style={styles.infoValue}>{apartment.owner}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={styles.infoValue}>{apartment.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>E-posta</Text>
                <Text style={styles.infoValue}>{apartment.email}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color={theme.colors.gray[400]} />
            <Text style={styles.emptyText}>Daire bilgisi bulunamadı.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loader: {
    marginTop: 50,
  },
  apartmentInfo: {
    gap: 20,
  },
  infoSection: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  infoLabel: {
    fontSize: 16,
    color: theme.colors.gray[600],
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.gray[600],
    marginTop: 16,
    fontWeight: '500',
  },
}); 