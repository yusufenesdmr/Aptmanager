import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { db } from '../../../config/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface CommonArea {
  id: string;
  name: string;
  type: 'spor' | 'havuz' | 'hamam' | 'diğer';
  capacity: number;
  isActive: boolean;
  currentBookings: number;
}

interface UserBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'approved' | 'rejected' | 'pending';
  userId: string;
}

export default function UserCommonAreas() {
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [userBookings, setUserBookings] = useState<{ [key: string]: UserBooking[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    const areasRef = collection(db, 'commonAreas');
    const unsubscribe = onSnapshot(areasRef, async (snapshot) => {
      const areasList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommonArea[];
      setAreas(areasList.filter(area => area.isActive));

      // Her alan için kullanıcının rezervasyonlarını al
      const bookings: { [key: string]: UserBooking[] } = {};
      for (const area of areasList) {
        const bookingsRef = collection(db, 'commonAreas', area.id, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsRef);
        const areaBookings = bookingsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            date: doc.data().date,
            startTime: doc.data().startTime,
            endTime: doc.data().endTime,
            status: doc.data().status || 'pending',
            userId: doc.data().userId,
          }))
          .filter(booking => booking.userId === user.uid);
        bookings[area.id] = areaBookings;
      }
      setUserBookings(bookings);
      setLoading(false);
    }, (error) => {
      console.error('Ortak alanlar dinlenirken hata:', error);
      Alert.alert('Hata', 'Ortak alanlar yüklenirken bir sorun oluştu.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spor':
        return 'fitness';
      case 'havuz':
        return 'water';
      case 'hamam':
        return 'water-outline';
      default:
        return 'apps';
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
          <Text style={styles.headerTitle}>Ortak Alanlar</Text>
          <TouchableOpacity
            style={styles.myBookingsButton}
            onPress={() => router.push('/user/common-areas/my-bookings')}>
            <Ionicons name="calendar" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          ) : areas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz aktif ortak alan bulunmuyor</Text>
            </View>
          ) : (
            areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={styles.areaCard}
                onPress={() => router.push({ pathname: "/user/common-areas/book/[id]", params: { id: area.id } })}>
                <View style={styles.areaHeader}>
                  <View style={styles.areaInfo}>
                    <Ionicons
                      name={getTypeIcon(area.type)}
                      size={24}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.areaName}>{area.name}</Text>
                  </View>
                  <View style={styles.capacityContainer}>
                    <Ionicons name="people" size={20} color="#666" />
                    <Text style={styles.capacityText}>
                      {area.currentBookings}/{area.capacity}
                    </Text>
                  </View>
                </View>

                <View style={styles.areaDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Tip:</Text>
                    <Text style={styles.detailValue}>
                      {area.type.charAt(0).toUpperCase() + area.type.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Durum:</Text>
                    <Text style={[styles.detailValue, styles.availableText]}>
                      {area.currentBookings < area.capacity ? 'Müsait' : 'Dolu'}
                    </Text>
                  </View>
                </View>

                {userBookings[area.id]?.length > 0 && (
                  <View style={styles.bookingsContainer}>
                    <Text style={styles.bookingsTitle}>Rezervasyonlarım:</Text>
                    {userBookings[area.id].map((booking) => (
                      <View key={booking.id} style={styles.bookingItem}>
                        <View style={styles.bookingInfo}>
                          <Text style={styles.bookingDate}>
                            {new Date(booking.date).toLocaleDateString('tr-TR')}
                          </Text>
                          <Text style={styles.bookingTime}>
                            {booking.startTime} - {booking.endTime}
                          </Text>
                        </View>
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
                    ))}
                  </View>
                )}

                <View style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Rezervasyon Yap</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
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
  },
  areaCard: {
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
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  areaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  capacityText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  areaDetails: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  availableText: {
    color: '#4CAF50',
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 5,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  myBookingsButton: {
    marginLeft: 'auto',
  },
  bookingsContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  bookingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingDate: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 