import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../config/firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';

interface Complaint {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: Date;
  userId: string;
  userName: string;
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const complaintsRef = collection(db, 'complaints');
      const q = query(complaintsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const allComplaints: Complaint[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allComplaints.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          userId: data.userId,
          userName: data.userName || 'Bilinmeyen Kullanıcı',
        });
      });

      setComplaints(allComplaints);
    } catch (error) {
      console.error('Şikayetler yüklenirken hata:', error);
      Alert.alert('Hata', 'Şikayetler yüklenirken bir sorun oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: 'pending' | 'in_progress' | 'resolved') => {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      await updateDoc(complaintRef, {
        status: newStatus,
      });
      
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint.id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
      
      Alert.alert('Başarılı', 'Şikayet durumu güncellendi!');
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      Alert.alert('Hata', 'Durum güncellenirken bir sorun oluştu!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'in_progress':
        return '#4169E1';
      case 'resolved':
        return '#32CD32';
      default:
        return '#666666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'in_progress':
        return 'İnceleniyor';
      case 'resolved':
        return 'Çözüldü';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Şikayet Yönetimi</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Şikayetler yükleniyor...</Text>
          </View>
        ) : complaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz şikayet bulunmuyor</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {complaints.map((complaint) => (
              <View key={complaint.id} style={styles.complaintCard}>
                <View style={styles.complaintHeader}>
                  <Text style={styles.complaintTitle}>{complaint.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(complaint.status) },
                    ]}>
                    <Text style={styles.statusText}>{getStatusText(complaint.status)}</Text>
                  </View>
                </View>
                <Text style={styles.userInfo}>Gönderen: {complaint.userName}</Text>
                <Text style={styles.complaintContent}>{complaint.content}</Text>
                <Text style={styles.dateText}>
                  {complaint.createdAt.toLocaleDateString('tr-TR')}
                </Text>
                
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[styles.statusButton, complaint.status === 'pending' && styles.activeButton]}
                    onPress={() => handleStatusChange(complaint.id, 'pending')}>
                    <Text style={styles.statusButtonText}>Beklemede</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.statusButton, complaint.status === 'in_progress' && styles.activeButton]}
                    onPress={() => handleStatusChange(complaint.id, 'in_progress')}>
                    <Text style={styles.statusButtonText}>İnceleniyor</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.statusButton, complaint.status === 'resolved' && styles.activeButton]}
                    onPress={() => handleStatusChange(complaint.id, 'resolved')}>
                    <Text style={styles.statusButtonText}>Çözüldü</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
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
    paddingTop: 50,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  complaintCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 5,
  },
  complaintContent: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#B0B0B0',
    textAlign: 'right',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statusButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}); 