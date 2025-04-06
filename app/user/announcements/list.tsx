import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt?: any;
}

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      console.log('Duyurular yükleniyor...');
      
      // Firestore referansını kontrol et
      if (!db) {
        throw new Error('Firestore bağlantısı bulunamadı!');
      }

      // Basit sorgu ile başla
      const querySnapshot = await getDocs(collection(db, 'announcements'));
      console.log('Sorgu sonucu:', querySnapshot.size, 'belge bulundu');

      const announcementsList: Announcement[] = [];
      querySnapshot.forEach((doc) => {
        console.log('Belge verisi:', doc.id, doc.data());
        announcementsList.push({
          id: doc.id,
          ...doc.data()
        } as Announcement);
      });

      setAnnouncements(announcementsList);
      setError(null);
    } catch (error: any) {
      console.error('Duyuru yükleme hatası:', error);
      setError(error.message || 'Duyurular yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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
          <Text style={styles.headerTitle}>Duyurular</Text>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#4c669f" />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchAnnouncements}>
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : announcements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#4c669f" />
              <Text style={styles.emptyText}>Henüz duyuru bulunmuyor.</Text>
            </View>
          ) : (
            announcements.map((announcement) => (
              <View key={announcement.id} style={styles.announcementCard}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                {announcement.createdAt && (
                  <Text style={styles.announcementDate}>
                    {announcement.createdAt.toDate().toLocaleDateString('tr-TR')}
                  </Text>
                )}
                <Text style={styles.announcementContent}>{announcement.content}</Text>
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
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
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
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
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
  retryButton: {
    backgroundColor: '#4c669f',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  announcementCard: {
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
    shadowRadius: 4,
    elevation: 3,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  announcementDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  announcementContent: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
}); 