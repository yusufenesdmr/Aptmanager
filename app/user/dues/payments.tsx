import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { theme } from '@/constants/theme';
import { getAuth } from 'firebase/auth';

interface Dues {
  id: string;
  month: string;
  year: string;
  amount: number;
  status: string;
  dueDate: any;
  paymentDate?: any;
  email?: string;
}

export default function DuesPayments() {
  const [dues, setDues] = useState<Dues[]>([]);
  const [loading, setLoading] = useState(true);

  // Sayfa her odaklandığında aidatları yeniden yükle
  useFocusEffect(
    React.useCallback(() => {
      console.log('Sayfa odaklandı, aidatlar yenileniyor...');
      fetchDues();
    }, [])
  );

  const fetchDues = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user?.email) {
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı!');
        setLoading(false);
        return;
      }

      // Önce kullanıcının daire bilgisini bul
      const apartmentsRef = collection(db, 'apartments');
      const apartmentQuery = query(apartmentsRef, where('email', '==', user.email));
      const apartmentSnapshot = await getDocs(apartmentQuery);

      if (apartmentSnapshot.empty) {
        Alert.alert('Bilgi', 'Size atanmış bir daire bulunamadı.');
        setLoading(false);
        return;
      }

      const apartmentId = apartmentSnapshot.docs[0].id;
      const apartmentData = apartmentSnapshot.docs[0].data();

      // Daireye ait aidatları çek
      const duesRef = collection(db, 'dues');
      const duesQuery = query(
        duesRef,
        where('apartmentId', '==', apartmentId),
        orderBy('year', 'desc'),
        orderBy('month', 'desc')
      );

      const duesSnapshot = await getDocs(duesQuery);
      
      // Tüm aidatları durumlarına göre güncelle
      const updatePromises = duesSnapshot.docs.map(doc => {
        const dueRef = doc.ref;
        const dueData = doc.data();
        const dueDate = dueData.dueDate.toDate();
        const today = new Date();
        
        let status = dueData.status;
        
        // Eğer ödeme tarihi varsa "Ödendi" olarak işaretle
        if (dueData.paymentDate) {
          status = 'Ödendi';
        }
        // Eğer ödenmemiş ve son ödeme tarihi geçmişse "Gecikmiş" olarak işaretle
        else if (dueDate < today) {
          status = 'Gecikmiş';
        }
        // Diğer durumlarda "Beklemede" olarak işaretle
        else {
          status = 'Beklemede';
        }
        
        return updateDoc(dueRef, {
          status: status,
          paymentDate: dueData.paymentDate || null
        });
      });
      
      await Promise.all(updatePromises);

      const duesData = duesSnapshot.docs.map(doc => {
        const data = doc.data();
        const dueDate = data.dueDate.toDate();
        const today = new Date();
        
        let status = data.status;
        
        // Eğer ödeme tarihi varsa "Ödendi" olarak işaretle
        if (data.paymentDate) {
          status = 'Ödendi';
        }
        // Eğer ödenmemiş ve son ödeme tarihi geçmişse "Gecikmiş" olarak işaretle
        else if (dueDate < today) {
          status = 'Gecikmiş';
        }
        // Diğer durumlarda "Beklemede" olarak işaretle
        else {
          status = 'Beklemede';
        }
        
        return {
          id: doc.id,
          ...data,
          status: status,
          email: apartmentData.email
        };
      }) as Dues[];

      console.log('Yüklenen aidatlar:', duesData);
      setDues(duesData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ödendi':
        return '#4CAF50';
      case 'Beklemede':
        return '#FFA000';
      case 'Gecikmiş':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const handlePayment = (due: Dues) => {
    router.push({
      pathname: '/user/dues/payment',
      params: {
        dueId: due.id,
        amount: due.amount,
        month: due.month,
        year: due.year
      }
    });
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Aidat Ödemeleri</Text>
        <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : dues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cash-outline" size={64} color={theme.colors.gray[400]} />
            <Text style={styles.emptyText}>Henüz aidat kaydı bulunmuyor.</Text>
              </View>
        ) : (
          <View style={styles.duesContainer}>
            {dues.map((due) => (
              <View key={due.id} style={styles.duesCard}>
                <View style={styles.duesHeader}>
                  <View>
                    <Text style={styles.duesTitle}>{due.month}/{due.year}</Text>
                    <Text style={styles.emailText}>{due.email}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(due.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(due.status) }]}>
                      {due.status}
                    </Text>
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
                  {due.status !== 'Ödendi' && (
                    <TouchableOpacity 
                      style={[styles.payButton, { backgroundColor: '#007AFF' }]}
                      onPress={() => handlePayment(due)}>
                      <Text style={styles.payButtonText}>Öde</Text>
                    </TouchableOpacity>
                  )}
            </View>
              </View>
            ))}
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
  loader: {
    marginTop: 50,
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
  duesContainer: {
    gap: 15,
  },
  duesCard: {
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
  duesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  duesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  duesDetails: {
    gap: 8,
  },
  duesAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  duesDate: {
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  paymentDate: {
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  payButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 12,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
}); 