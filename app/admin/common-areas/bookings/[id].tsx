import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, DocumentData, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  userId: string;
  status: 'approved' | 'rejected' | 'pending';
  userInfo: {
    name: string;
    phone: string;
    email: string;
    apartmentNo: string;
  };
}

interface UserData {
  name?: string;
  phone?: string;
  email?: string;
  apartmentId?: string;
}

interface ApartmentData {
  number?: string;
}

function isFirestoreTimestamp(date: any): date is { seconds: number; nanoseconds: number } {
  return date && typeof date === 'object' && typeof date.seconds === 'number' && typeof date.nanoseconds === 'number';
}

export default function AreaBookings() {
  const { id } = useLocalSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [id]);

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings for areaId:', id);
      
      const bookingsRef = collection(db, 'commonAreas', id as string, 'bookings');
      const querySnapshot = await getDocs(bookingsRef);
      console.log('Query snapshot size:', querySnapshot.size);
      
      const bookingsData = await Promise.all(
        querySnapshot.docs.map(async (bookingDoc) => {
          const bookingData = bookingDoc.data();
          console.log('Booking data:', {
            id: bookingDoc.id,
            ...bookingData
          });
          
          // Kullanıcı bilgilerini çek
          console.log('Fetching user data for userId:', bookingData.userId);
          const userRef = doc(db, 'users', bookingData.userId);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            console.log('User document does not exist for ID:', bookingData.userId);
            return {
              id: bookingDoc.id,
              date: bookingData.date,
              timeSlot: `${bookingData.startTime} - ${bookingData.endTime}`,
              userId: bookingData.userId,
              status: 'pending',
              userInfo: {
                name: 'Bilinmeyen Kullanıcı',
                phone: '-',
                email: bookingData.userEmail || '-',
                apartmentNo: '-',
              },
            };
          }
          
          const userData = userDoc.data();
          console.log('User data from Firestore:', userData);

          let apartmentNo = '-';
          if (userData?.apartmentId) {
            try {
              console.log('Fetching apartment data for apartmentId:', userData.apartmentId);
              const apartmentRef = doc(db, 'apartments', userData.apartmentId);
              const apartmentDoc = await getDoc(apartmentRef);
              
              if (apartmentDoc.exists()) {
                const apartmentData = apartmentDoc.data();
                console.log('Apartment data from Firestore:', apartmentData);
                apartmentNo = apartmentData?.number || '-';
              } else {
                console.log('Apartment document does not exist for ID:', userData.apartmentId);
              }
            } catch (error) {
              console.error('Daire bilgileri çekilirken hata:', error);
            }
          } else {
            console.log('No apartmentId found in user data');
          }

          const bookingInfo = {
            id: bookingDoc.id,
            date: bookingData.date,
            timeSlot: `${bookingData.startTime} - ${bookingData.endTime}`,
            userId: bookingData.userId,
            status: bookingData.status,
            userInfo: {
              name: userData?.name || 'Bilinmeyen Kullanıcı',
              phone: userData?.phone || '-',
              email: userData?.email || '-',
              apartmentNo: apartmentNo,
            },
          };
          
          console.log('Final booking info:', bookingInfo);
          return bookingInfo;
        })
      );

      console.log('Final bookings data:', bookingsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Rezervasyonlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Rezervasyonlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId: string) => {
    Alert.alert(
      'Rezervasyon İptali',
      'Bu rezervasyonu iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              // Rezervasyonu sil
              await deleteDoc(doc(db, 'commonAreas', id as string, 'bookings', bookingId));

              // Alanın mevcut rezervasyon sayısını güncelle
              const areaRef = doc(db, 'commonAreas', id as string);
              const areaDoc = await getDoc(areaRef);
              if (areaDoc.exists()) {
                const areaData = areaDoc.data();
                await updateDoc(areaRef, {
                  currentBookings: Math.max(0, (areaData.currentBookings || 0) - 1),
                });
              }

              // Rezervasyon listesini güncelle
              setBookings(bookings.filter(booking => booking.id !== bookingId));
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

  const handleUpdateStatus = async (bookingId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const bookingRef = doc(db, 'commonAreas', id as string, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Rezervasyon listesini güncelle
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));

      Alert.alert('Başarılı', 'Rezervasyon durumu güncellendi.');
    } catch (error) {
      console.error('Rezervasyon durumu güncellenirken hata:', error);
      Alert.alert('Hata', 'Rezervasyon durumu güncellenirken bir sorun oluştu.');
    }
  };

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
          <Text style={styles.headerTitle}>
            Rezervasyonlar
          </Text>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          ) : bookings.length === 0 ? (
            <Text style={styles.noBookingsText}>Henüz rezervasyon bulunmuyor.</Text>
          ) : (
            bookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingDate}>{booking.date}</Text>
                  <Text style={styles.bookingTime}>{booking.timeSlot}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{booking.userInfo?.name}</Text>
                  <Text style={styles.userDetail}>Daire: {booking.userInfo?.apartmentNo}</Text>
                  <Text style={styles.userDetail}>Telefon: {booking.userInfo?.phone}</Text>
                  <Text style={styles.userDetail}>E-posta: {booking.userInfo?.email}</Text>
                </View>

                <View style={styles.actionsContainer}>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[styles.statusButton, booking.status === 'approved' && styles.activeStatusButton]}
                      onPress={() => handleUpdateStatus(booking.id, 'approved')}>
                      <Text style={[styles.statusButtonText, booking.status === 'approved' && styles.activeStatusButtonText]}>
                        Onayla
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statusButton, booking.status === 'rejected' && styles.rejectedStatusButton]}
                      onPress={() => handleUpdateStatus(booking.id, 'rejected')}>
                      <Text style={[styles.statusButtonText, booking.status === 'rejected' && styles.rejectedStatusButtonText]}>
                        Reddet
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(booking.id)}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.deleteButtonText}>İptal Et</Text>
                  </TouchableOpacity>
                </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  noBookingsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  bookingTime: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
  userInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  actionsContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusButton: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeStatusButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  rejectedStatusButton: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  statusButtonText: {
    color: '#666',
    fontSize: 14,
  },
  activeStatusButtonText: {
    color: '#fff',
  },
  rejectedStatusButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  deleteButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
}); 