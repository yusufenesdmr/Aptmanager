import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function UserAnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        console.log('Duyurular yükleniyor...');
        
        if (!db) {
          throw new Error('Firestore bağlantısı bulunamadı!');
        }

        const announcementsRef = collection(db, 'announcements');
        const q = query(announcementsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const announcementsList: Announcement[] = [];
          snapshot.forEach((doc) => {
            announcementsList.push({
              id: doc.id,
              ...doc.data()
            } as Announcement);
          });
          console.log('Duyurular başarıyla yüklendi:', announcementsList.length);
          setAnnouncements(announcementsList);
          setLoading(false);
          setError(null);
        }, (error) => {
          console.error('Duyuru dinleme hatası:', error);
          setLoading(false);
          setError('Duyurular yüklenirken bir hata oluştu.');
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Duyuru yükleme hatası:', error);
        setLoading(false);
        setError('Duyurular yüklenirken bir hata oluştu.');
      }
    };

    fetchAnnouncements();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = ({ item }: { item: Announcement }) => (
    <View style={styles.announcementItem}>
      <Text style={styles.announcementTitle}>{item.title}</Text>
      <Text style={styles.announcementContent}>{item.content}</Text>
      <Text style={styles.announcementDate}>
        {item.createdAt?.toDate().toLocaleDateString('tr-TR')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.headerTitle}>Duyurular</Text>
          </View>

          {loading ? (
            <View style={styles.centeredContainer}>
              <ActivityIndicator size="large" color="#4c669f" />
            </View>
          ) : error ? (
            <View style={styles.centeredContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : announcements.length === 0 ? (
            <View style={styles.centeredContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#4c669f" />
              <Text style={styles.emptyText}>Henüz duyuru bulunmuyor.</Text>
            </View>
          ) : (
            <FlatList
              data={announcements}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            />
          )}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 20,
  },
  announcementItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
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
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  announcementContent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    lineHeight: 24,
  },
  announcementDate: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
}); 