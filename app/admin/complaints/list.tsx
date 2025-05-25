import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../config/firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy, where, getDoc, DocumentData } from 'firebase/firestore';

interface UserData {
  name?: string;
  email?: string;
  apartment?: string;
  block?: string;
  floor?: string;
}

interface Complaint {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: Date;
  userId: string;
  userName: string;
  userEmail: string;
  userApartment: string;
  userBlock: string;
  userFloor: string;
  response?: string;
  responseDate?: Date;
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);

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
      for (const complaintDoc of querySnapshot.docs) {
        const data = complaintDoc.data();
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        const userData = userDoc.data() as UserData;

        const apartmentsRef = collection(db, 'apartments');
        const apartmentQuery = query(apartmentsRef, where('email', '==', userData?.email));
        const apartmentSnapshot = await getDocs(apartmentQuery);
        const apartmentData = apartmentSnapshot.docs[0]?.data();

        const apartmentNo = apartmentData?.apartmentNo || '';

        allComplaints.push({
          id: complaintDoc.id,
          title: data.title,
          content: data.content,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          userId: data.userId,
          userName: userData?.name || '',
          userEmail: userData?.email || '',
          userApartment: apartmentNo,
          userBlock: apartmentData?.block || '',
          userFloor: apartmentData?.floor || '',
          response: data.response,
          responseDate: data.responseDate?.toDate(),
        });
      }

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

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFFFFF';
      case 'in_progress':
        return '#FFFFFF';
      case 'resolved':
        return '#FFFFFF';
      default:
        return '#FFFFFF';
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

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         complaint.content.toLowerCase().includes(searchText.toLowerCase()) ||
                         complaint.userName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !selectedStatus || complaint.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleFilter = (status: string | null) => {
    setSelectedStatus(status);
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.response || '');
    setShowResponseModal(true);
  };

  const handleSendResponse = async () => {
    if (!selectedComplaint || !responseText.trim()) return;

    try {
      const complaintRef = doc(db, 'complaints', selectedComplaint.id);
      await updateDoc(complaintRef, {
        response: responseText,
        responseDate: new Date(),
      });

      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint.id === selectedComplaint.id
            ? { ...complaint, response: responseText, responseDate: new Date() }
            : complaint
        )
      );

      Alert.alert('Başarılı', 'Yanıt başarıyla gönderildi!');
      setShowResponseModal(false);
    } catch (error) {
      console.error('Yanıt gönderilirken hata:', error);
      Alert.alert('Hata', 'Yanıt gönderilirken bir sorun oluştu!');
    }
  };

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
          <Text style={styles.headerTitle}>Şikayet Yönetimi</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="filter" size={24} color="#4c669f" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Şikayet ara..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {showFilters && (
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedStatus && styles.activeFilterChip]}
              onPress={() => handleFilter(null)}>
              <Text style={[styles.filterChipText, !selectedStatus && styles.activeFilterChipText]}>
                Tümü
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'pending' && styles.activeFilterChip]}
              onPress={() => handleFilter('pending')}>
              <Text style={[styles.filterChipText, selectedStatus === 'pending' && styles.activeFilterChipText]}>
                Beklemede
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'in_progress' && styles.activeFilterChip]}
              onPress={() => handleFilter('in_progress')}>
              <Text style={[styles.filterChipText, selectedStatus === 'in_progress' && styles.activeFilterChipText]}>
                İnceleniyor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'resolved' && styles.activeFilterChip]}
              onPress={() => handleFilter('resolved')}>
              <Text style={[styles.filterChipText, selectedStatus === 'resolved' && styles.activeFilterChipText]}>
                Çözüldü
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4c669f" />
            <Text style={styles.loadingText}>Şikayetler yükleniyor...</Text>
          </View>
        ) : filteredComplaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchText || selectedStatus
                ? 'Arama kriterlerine uygun şikayet bulunamadı'
                : 'Henüz şikayet bulunmuyor'}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {filteredComplaints.map((complaint) => (
              <TouchableOpacity
                key={complaint.id}
                style={styles.complaintCard}
                onPress={() => handleViewDetails(complaint)}>
                <View style={styles.complaintHeader}>
                  <View style={styles.complaintInfo}>
                    <Text style={styles.complaintTitle}>{complaint.title}</Text>
                    <View style={styles.userInfo}>
                      <Text style={styles.userEmail}>{complaint.userEmail}</Text>
                      <Text style={styles.userDetails}>
                        {complaint.userApartment ? `Daire ${complaint.userApartment}` : ''}
                        {complaint.userFloor ? ` ${complaint.userFloor}. Kat` : ''}
                        {complaint.userBlock ? ` ${complaint.userBlock} Blok` : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusTextColor(complaint.status) }]}>
                      {getStatusText(complaint.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.complaintContent} numberOfLines={2}>
                  {complaint.content}
                </Text>
                <Text style={styles.complaintDate}>
                  {complaint.createdAt.toLocaleDateString('tr-TR')}
                </Text>
                
                <View style={styles.statusButtonsContainer}>
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

                {complaint.response && (
                  <View style={styles.responseContainer}>
                    <Text style={styles.responseLabel}>Yanıt:</Text>
                    <Text style={styles.responseText}>{complaint.response}</Text>
                    <Text style={styles.responseDate}>
                      {complaint.responseDate?.toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </LinearGradient>

      <Modal
        visible={showResponseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResponseModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şikayet Detayları</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowResponseModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedComplaint && (
              <>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Başlık:</Text>
                  <Text style={styles.detailText}>{selectedComplaint.title}</Text>
                </View>

                {selectedComplaint.userName && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Gönderen:</Text>
                    <Text style={styles.detailText}>{selectedComplaint.userName}</Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>İletişim Bilgileri:</Text>
                  <Text style={styles.detailText}>
                    {selectedComplaint.userApartment && `Daire ${selectedComplaint.userApartment}`}
                    {selectedComplaint.userBlock && ` - Blok ${selectedComplaint.userBlock}`}
                    {selectedComplaint.userFloor && ` - Kat ${selectedComplaint.userFloor}`}
                  </Text>
                  {selectedComplaint.userEmail && (
                    <Text style={styles.detailText}>{selectedComplaint.userEmail}</Text>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Durum:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedComplaint.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusTextColor(selectedComplaint.status) }]}>
                      {getStatusText(selectedComplaint.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tarih:</Text>
                  <Text style={styles.detailText}>
                    {selectedComplaint.createdAt.toLocaleDateString('tr-TR')}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>İçerik:</Text>
                  <Text style={styles.detailText}>{selectedComplaint.content}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Yanıt:</Text>
                  <TextInput
                    style={styles.responseInput}
                    multiline
                    numberOfLines={4}
                    value={responseText}
                    onChangeText={setResponseText}
                    placeholder="Yanıtınızı buraya yazın..."
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowResponseModal(false)}>
                    <Text style={styles.cancelButtonText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.sendButton]}
                    onPress={handleSendResponse}>
                    <Text style={styles.sendButtonText}>Yanıtla</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4c669f',
  },
  backButton: {
    padding: 10,
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#4c669f',
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  complaintCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  complaintInfo: {
    flex: 1,
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userInfo: {
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 12,
    color: '#666',
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
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  complaintDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 15,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#4c669f',
  },
  statusButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  filterButton: {
    padding: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    marginBottom: 10,
  },
  activeFilterChip: {
    backgroundColor: '#4c669f',
  },
  filterChipText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterChipText: {
    color: 'white',
  },
  responseContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4c669f',
    marginBottom: 5,
  },
  responseText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  responseDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
  responseSection: {
    marginTop: 20,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  sendButton: {
    backgroundColor: '#4c669f',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 