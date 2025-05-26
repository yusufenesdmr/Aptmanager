import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../../config/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Complaint {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: Date;
  response?: string;
  responseDate?: Date;
  userName: string;
  userEmail: string;
  userApartment?: string;
  userFloor?: string;
  userBlock?: string;
  userId: string;
}

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

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

      // Tüm şikayetleri çek
      const complaintsRef = collection(db, 'complaints');
      const q = query(complaintsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const allComplaints: Complaint[] = [];
      for (const complaintDoc of querySnapshot.docs) {
        const data = complaintDoc.data();
        const userId = data.userId;

        // Şikayeti yazan kullanıcının bilgilerini al
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data() as { name?: string; email?: string };

        // Kullanıcının daire bilgilerini al
        const apartmentsRef = collection(db, 'apartments');
        const apartmentQuery = query(apartmentsRef, where('email', '==', userData?.email));
        const apartmentSnapshot = await getDocs(apartmentQuery);
        const apartmentData = apartmentSnapshot.docs[0]?.data();

        allComplaints.push({
          id: complaintDoc.id,
          title: data.title,
          content: data.content,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          response: data.response,
          responseDate: data.responseDate?.toDate(),
          userName: userData?.name || 'Kullanıcı',
          userEmail: userData?.email || '',
          userApartment: apartmentData?.apartmentNo || apartmentData?.apartment || '',
          userFloor: apartmentData?.floor || '',
          userBlock: apartmentData?.block || '',
          userId: userId,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFF3E0'; // Açık turuncu arka plan
      case 'in_progress':
        return '#E3F2FD'; // Açık mavi arka plan
      case 'resolved':
        return '#E8F5E9'; // Açık yeşil arka plan
      default:
        return '#F5F5F5';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#E65100'; // Koyu turuncu metin
      case 'in_progress':
        return '#1565C0'; // Koyu mavi metin
      case 'resolved':
        return '#2E7D32'; // Koyu yeşil metin
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

  const handleEditComplaint = async () => {
    if (!selectedComplaint || !editTitle.trim() || !editContent.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve içerik alanlarını doldurun.');
      return;
    }

    try {
      const complaintRef = doc(db, 'complaints', selectedComplaint.id);
      await updateDoc(complaintRef, {
        title: editTitle,
        content: editContent,
        updatedAt: new Date()
      });

      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint.id === selectedComplaint.id
            ? { ...complaint, title: editTitle, content: editContent }
            : complaint
        )
      );

      Alert.alert('Başarılı', 'Şikayet başarıyla güncellendi!');
      setShowEditModal(false);
    } catch (error) {
      console.error('Şikayet güncellenirken hata:', error);
      Alert.alert('Hata', 'Şikayet güncellenirken bir sorun oluştu!');
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    Alert.alert(
      'Şikayeti Sil',
      'Bu şikayeti silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'complaints', complaintId));
              setComplaints(prevComplaints =>
                prevComplaints.filter(complaint => complaint.id !== complaintId)
              );
              Alert.alert('Başarılı', 'Şikayet başarıyla silindi!');
              setShowDetailsModal(false);
            } catch (error) {
              console.error('Şikayet silinirken hata:', error);
              Alert.alert('Hata', 'Şikayet silinirken bir sorun oluştu!');
            }
          }
        }
      ]
    );
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setEditTitle(complaint.title);
    setEditContent(complaint.content);
    setShowDetailsModal(true);
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
          <Text style={styles.headerTitle}>Şikayetler</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/user/complaints/add')}>
            <Ionicons name="add-circle" size={24} color="#4c669f" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {complaints.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz şikayet bulunmuyor</Text>
            </View>
          ) : (
            complaints.map((complaint) => (
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
            ))
          )}
        </ScrollView>

        <Modal
          visible={showDetailsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDetailsModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Şikayet Detayları</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDetailsModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {selectedComplaint && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Başlık:</Text>
                    <Text style={styles.detailText}>{selectedComplaint.title}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Gönderen:</Text>
                    <Text style={styles.detailText}>{selectedComplaint.userEmail}</Text>
                    <Text style={styles.detailText}>
                      {selectedComplaint.userApartment ? `Daire ${selectedComplaint.userApartment}` : ''}
                      {selectedComplaint.userFloor ? ` ${selectedComplaint.userFloor}. Kat` : ''}
                      {selectedComplaint.userBlock ? ` ${selectedComplaint.userBlock} Blok` : ''}
                    </Text>
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

                  {selectedComplaint.response && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Yanıt:</Text>
                      <View style={styles.responseBox}>
                        <Text style={styles.responseText}>{selectedComplaint.response}</Text>
                        <Text style={styles.responseDate}>
                          Yanıt Tarihi: {selectedComplaint.responseDate?.toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                    </View>
                  )}

                  {selectedComplaint.userId === auth.currentUser?.uid && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => {
                          setShowDetailsModal(false);
                          setShowEditModal(true);
                        }}>
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Düzenle</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteComplaint(selectedComplaint.id)}>
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Sil</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Şikayeti Düzenle</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowEditModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.editForm}>
                <Text style={styles.formLabel}>Başlık</Text>
                <TextInput
                  style={styles.input}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Şikayet başlığı"
                />

                <Text style={styles.formLabel}>İçerik</Text>
                <TextInput
                  style={[styles.input, styles.contentInput]}
                  value={editContent}
                  onChangeText={setEditContent}
                  placeholder="Şikayet içeriği"
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editButtonContainer, styles.cancelButton]}
                    onPress={() => setShowEditModal(false)}>
                    <Text style={styles.editButtonText}>İptal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.editButtonContainer, styles.saveButton]}
                    onPress={handleEditComplaint}>
                    <Text style={styles.editButtonText}>Kaydet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
    color: '#666',
    textAlign: 'center',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
    borderWidth: 1,
  },
  statusText: {
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
  },
  responseContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e7f0',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c5282',
    marginBottom: 5,
  },
  responseText: {
    fontSize: 14,
    color: '#2d3748',
    marginBottom: 5,
    lineHeight: 20,
  },
  responseDate: {
    fontSize: 12,
    color: '#718096',
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
    marginBottom: 4,
  },
  responseBox: {
    backgroundColor: '#f0f4f8',
    padding: 15,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e0e7f0',
  },
  userName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#4c669f',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editForm: {
    marginTop: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  contentInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  editButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#4c669f',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 