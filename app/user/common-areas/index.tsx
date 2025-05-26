import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { db } from '../../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface CommonArea {
  id: string;
  name: string;
  type: 'spor' | 'havuz' | 'hamam' | 'diğer';
  capacity: number;
  isActive: boolean;
  currentBookings: number;
}

export default function UserCommonAreas() {
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAreas = async () => {
    try {
      const areasRef = collection(db, 'commonAreas');
      const snapshot = await getDocs(areasRef);
      const areasList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommonArea[];
      setAreas(areasList.filter(area => area.isActive));
    } catch (error) {
      console.error('Ortak alanlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Ortak alanlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
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
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          ) : areas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aktif ortak alan bulunmuyor</Text>
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
}); 