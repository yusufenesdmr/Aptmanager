import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../../config/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';

interface Complaint {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: Date;
}

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Hata', 'Kullanıcı girişi yapılmamış!');
        return;
      }

      const complaintsRef = collection(db, 'complaints');
      const q = query(complaintsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const userComplaints: Complaint[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userComplaints.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          status: data.status,
          createdAt: data.createdAt.toDate(),
        });
      });

      setComplaints(userComplaints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Şikayetler yüklenirken hata:', error);
      Alert.alert('Hata', 'Şikayetler yüklenirken bir sorun oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500'; // Turuncu
      case 'in_progress':
        return '#4169E1'; // Mavi
      case 'resolved':
        return '#32CD32'; // Yeşil
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
          <Text style={styles.headerTitle}>Şikayetlerim</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/user/complaints/add')}>
            <Ionicons name="add-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {complaints.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz şikayet bulunmuyor</Text>
            </View>
          ) : (
            complaints.map((complaint) => (
              <View key={complaint.id} style={styles.complaintCard}>
                <View style={styles.complaintHeader}>
                  <Text style={styles.complaintTitle}>{complaint.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(complaint.status)}</Text>
                  </View>
                </View>
                <Text style={styles.complaintContent}>{complaint.content}</Text>
                <Text style={styles.complaintDate}>
                  {complaint.createdAt.toLocaleDateString('tr-TR')}
                </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    padding: 10,
  },
  addButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
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
  complaintContent: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 10,
  },
  complaintDate: {
    fontSize: 12,
    color: '#B0B0B0',
    textAlign: 'right',
  },
}); 