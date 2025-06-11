import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { db } from '../../../config/firebase';
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Booking {
  id: string;
  areaId: string;
  areaName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'approved' | 'rejected' | 'pending';
  userId: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Hata', 'Lütfen giriş yapın.');
        router.push('/(auth)/login');
        return;
      }

      // Tüm ortak alanları al
      const areasRef = collection(db, 'commonAreas');
      const areasSnapshot = await getDocs(areasRef);
      const areas = areasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Her alan için rezervasyonları kontrol et
      const allBookings: Booking[] = [];
      for (const area of areas) {
        const bookingsRef = collection(db, 'commonAreas', area.id, 'bookings');
        const snapshot = await getDocs(bookingsRef);
        const areaBookings = snapshot.docs
          .map(doc => ({
            id: doc.id,
            areaId: area.id,
            areaName: area.name,
            date: doc.data().date,
            startTime: doc.data().startTime,
            endTime: doc.data().endTime,
            status: doc.data().status || 'pending',
            userId: doc.data().userId,
          }))
          .filter(booking => booking.userId === user.uid);
        allBookings.push(...areaBookings);
      }

      // Tarihe göre sırala (en yeniden en eskiye)
      allBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBookings(allBookings);
    } catch (error) {
      console.error('Rezervasyonlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Rezervasyonlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    Alert.alert(
      'Rezervasyonu İptal Et',
      'Bu rezervasyonu iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              // Rezervasyonu sil
              await deleteDoc(doc(db, 'commonAreas', booking.areaId, 'bookings', booking.id));

              // Alanın mevcut rezervasyon sayısını güncelle
              const areaRef = doc(db, 'commonAreas', booking.areaId);
              const areaDoc = await getDoc(areaRef);
              if (areaDoc.exists()) {
                const areaData = areaDoc.data();
                await updateDoc(areaRef, {
                  currentBookings: areaData.currentBookings - 1,
                });
              }

              await fetchBookings();
              Alert.alert('Başarılı', 'Rezervasyon başarıyla iptal edildi.');
            } catch (error) {
              console.error('Rezervasyon iptal edilirken hata:', error);
              Alert.alert('Hata', 'Rezervasyon iptal edilirken bir sorun oluştu.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#f44336';
      default:
        return '#FFA000';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      default:
        return 'Beklemede';
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
          <Text style={styles.headerTitle}>Rezervasyonlarım</Text>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          ) : bookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz rezervasyonunuz yok</Text>
              <TouchableOpacity
                style={styles.newBookingButton}
                onPress={() => router.push('/user/common-areas')}>
                <Text style={styles.newBookingButtonText}>Yeni Rezervasyon Yap</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.areaName}>{booking.areaName}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(booking.status) },
                    ]}>
                    <Text style={styles.statusText}>
                      {getStatusText(booking.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={20} color="#666" />
                    <Text style={styles.detailText}>
                      {new Date(booking.date).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={20} color="#666" />
                    <Text style={styles.detailText}>
                      {booking.startTime} - {booking.endTime}
                    </Text>
                  </View>
                </View>

                {booking.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelBooking(booking)}>
                    <Ionicons name="close-circle" size={20} color="#fff" />
                    <Text style={styles.cancelButtonText}>Rezervasyonu İptal Et</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
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
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  newBookingButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  newBookingButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  areaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingDetails: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 