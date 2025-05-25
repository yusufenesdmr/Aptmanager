import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Dues {
  id: string;
  amount: number;
  month: string;
  year: string;
  status: string;
  dueDate: {
    seconds: number;
    nanoseconds: number;
  };
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function ApartmentDuesList() {
  const { apartmentId, apartmentNo } = useLocalSearchParams();
  const [dues, setDues] = useState<Dues[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apartmentId) return;

    const duesQuery = query(
      collection(db, 'dues'),
      where('apartmentId', '==', apartmentId),
      orderBy('year', 'desc'),
      orderBy('month', 'desc')
    );

    const unsubscribe = onSnapshot(duesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dues[];
      setDues(data);
      setLoading(false);
    }, (error) => {
      console.error("Aidatlar çekilirken hata oluştu:", error);
      setLoading(false);
      Alert.alert('Hata', 'Aidatlar yüklenirken bir sorun oluştu.');
    });

    return () => unsubscribe();
  }, [apartmentId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (date: { seconds: number; nanoseconds: number }) => {
    if (!date) return 'Belirtilmemiş';
    return new Date(date.seconds * 1000).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDueDateStatus = (dueDate: Dues['dueDate']) => {
    if (!dueDate) {
      return {
        status: 'Tarih Belirtilmemiş',
        color: '#8E8E93',
        bgColor: '#8E8E9320'
      };
    }

    const now = new Date();
    const dueDateObj = new Date(dueDate.seconds * 1000);
    const diffTime = dueDateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'Gecikmiş',
        color: '#FF3B30',
        bgColor: '#FF3B3020'
      };
    } else if (diffDays <= 3) {
      return {
        status: 'Son 3 Gün',
        color: '#FF9500',
        bgColor: '#FF950020'
      };
    } else {
      return {
        status: 'Aktif',
        color: '#34C759',
        bgColor: '#34C75920'
      };
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
          <Text style={styles.headerTitle}>Daire {apartmentNo} Aidatları</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          ) : dues.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bu daireye ait aidat bulunamadı.</Text>
            </View>
          ) : (
            <View style={styles.duesContainer}>
              {dues.map((due) => {
                const dueDateStatus = getDueDateStatus(due.dueDate);
                return (
                  <View key={due.id} style={styles.duesCard}>
                    <View style={styles.duesHeader}>
                      <Text style={styles.duesTitle}>
                        {due.month}/{due.year}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: dueDateStatus.bgColor }]}>
                        <Text style={[styles.statusText, { color: dueDateStatus.color }]}>
                          {dueDateStatus.status}
                    </Text>
                  </View>
                    </View>
                    <View style={styles.duesDetails}>
                      <Text style={styles.duesAmount}>{formatCurrency(due.amount)}</Text>
                      <Text style={styles.duesDate}>
                        Son Ödeme: {formatDate(due.dueDate)}
                      </Text>
                      <Text style={styles.createdDate}>
                        Oluşturulma: {formatDate(due.createdAt)}
                      </Text>
                    </View>
                  </View>
                );
              })}
                </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  duesContainer: {
    gap: 15,
  },
  duesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
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
    color: '#fff',
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
    color: '#fff',
  },
  duesDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  createdDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
}); 