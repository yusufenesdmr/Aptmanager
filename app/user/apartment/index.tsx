import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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

interface Dues {
  id: string;
  month: string;
  year: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: any;
  paymentDate?: any;
}

export default function ApartmentManagement() {
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [dues, setDues] = useState<Dues[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApartmentData();
  }, []);

  const fetchApartmentData = async () => {
    try {
      // Daire bilgilerini çek
      const apartmentsRef = collection(db, 'apartments');
      const q = query(apartmentsRef, where('userId', '==', 'current-user-id')); // Gerçek kullanıcı ID'si ile değiştirilecek
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const apartmentData = querySnapshot.docs[0].data() as Apartment;
        setApartment({ ...apartmentData, id: querySnapshot.docs[0].id });
      }

      // Aidat bilgilerini çek
      const duesRef = collection(db, 'dues');
      const duesQuery = query(
        duesRef,
        where('apartmentId', '==', 'current-user-id'), // Gerçek daire ID'si ile değiştirilecek
        orderBy('dueDate', 'desc')
      );
      
      const duesSnapshot = await getDocs(duesQuery);
      const duesData = duesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Dues[];
      
      setDues(duesData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getDuesStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#4caf50';
      case 'unpaid':
        return '#ff9800';
      case 'overdue':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getDuesStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Ödendi';
      case 'unpaid':
        return 'Ödenmedi';
      case 'overdue':
        return 'Gecikmiş';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
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
          <Text style={styles.headerTitle}>Daire Yönetimi</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('edit')}>
            <Ionicons name="create-outline" size={24} color="#4c669f" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {apartment && (
            <View style={styles.apartmentInfo}>
              <Text style={styles.sectionTitle}>Daire Bilgileri</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Blok:</Text>
                <Text style={styles.infoValue}>{apartment.block}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Daire No:</Text>
                <Text style={styles.infoValue}>{apartment.number}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kat:</Text>
                <Text style={styles.infoValue}>{apartment.floor}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Daire Sahibi:</Text>
                <Text style={styles.infoValue}>{apartment.owner}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefon:</Text>
                <Text style={styles.infoValue}>{apartment.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>E-posta:</Text>
                <Text style={styles.infoValue}>{apartment.email}</Text>
              </View>
            </View>
          )}

          <View style={styles.duesSection}>
            <Text style={styles.sectionTitle}>Aidat Ödemeleri</Text>
            {dues.length === 0 ? (
              <Text style={styles.emptyText}>Henüz aidat kaydı bulunmuyor</Text>
            ) : (
              dues.map((due) => (
                <View key={due.id} style={styles.duesCard}>
                  <View style={styles.duesHeader}>
                    <Text style={styles.duesTitle}>
                      {due.month} {due.year}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getDuesStatusColor(due.status) }]}>
                      <Text style={styles.statusText}>{getDuesStatusText(due.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.duesDetails}>
                    <Text style={styles.duesAmount}>{formatCurrency(due.amount)}</Text>
                    <Text style={styles.duesDate}>
                      Son Ödeme: {due.dueDate?.toDate().toLocaleDateString('tr-TR')}
                    </Text>
                    {due.paymentDate && (
                      <Text style={styles.paymentDate}>
                        Ödeme Tarihi: {due.paymentDate.toDate().toLocaleDateString('tr-TR')}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
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
  editButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  apartmentInfo: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  duesSection: {
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  duesCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  duesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  duesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  duesDetails: {
    marginTop: 10,
  },
  duesAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4c669f',
    marginBottom: 5,
  },
  duesDate: {
    fontSize: 14,
    color: '#666',
  },
  paymentDate: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 5,
  },
}); 