import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { db } from '../../../config/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface CommonArea {
  id: string;
  name: string;
  type: 'spor' | 'havuz' | 'hamam' | 'diğer';
  capacity: number;
  isActive: boolean;
  currentBookings: number;
}

export default function CommonAreasList() {
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
      setAreas(areasList);
    } catch (error) {
      console.error('Ortak alanlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Ortak alanlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (areaId: string, currentStatus: boolean) => {
    try {
      const areaRef = doc(db, 'commonAreas', areaId);
      await updateDoc(areaRef, {
        isActive: !currentStatus
      });
      await fetchAreas();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      Alert.alert('Hata', 'Durum güncellenirken bir sorun oluştu.');
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
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/admin/common-areas/add')}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          ) : areas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz ortak alan eklenmemiş</Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => router.push('/admin/common-areas/add')}>
                <Text style={styles.addFirstButtonText}>İlk Ortak Alanı Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            areas.map((area) => (
              <View key={area.id} style={styles.areaCard}>
                <View style={styles.areaHeader}>
                  <View style={styles.areaInfo}>
                    <Ionicons
                      name={getTypeIcon(area.type)}
                      size={24}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.areaName}>{area.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      area.isActive ? styles.activeButton : styles.inactiveButton,
                    ]}
                    onPress={() => handleToggleStatus(area.id, area.isActive)}>
                    <Text style={styles.statusButtonText}>
                      {area.isActive ? 'Aktif' : 'Pasif'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.areaDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Tip:</Text>
                    <Text style={styles.detailValue}>
                      {area.type.charAt(0).toUpperCase() + area.type.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Kapasite:</Text>
                    <Text style={styles.detailValue}>{area.capacity}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Mevcut Rezervasyon:</Text>
                    <Text style={styles.detailValue}>{area.currentBookings}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.bookingsButton}
                  onPress={() => router.push({ pathname: "/admin/common-areas/bookings/[id]", params: { id: area.id } })}>
                  <Text style={styles.bookingsButtonText}>Rezervasyonları Görüntüle</Text>
                </TouchableOpacity>
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
    justifyContent: 'space-between',
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
  },
  addButton: {
    padding: 8,
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
  addFirstButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addFirstButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
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
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  inactiveButton: {
    backgroundColor: '#f44336',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bookingsButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookingsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 