import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, RefreshControl, SafeAreaView, Modal, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

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
        }, (error) => {
          console.error('Duyuru dinleme hatası:', error);
          Alert.alert('Hata', 'Duyurular yüklenirken bir hata oluştu!');
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Duyuru yükleme hatası:', error);
        Alert.alert('Hata', 'Duyurular yüklenirken bir hata oluştu!');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      Alert.alert(
        'Duyuruyu Sil',
        'Bu duyuruyu silmek istediğinizden emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              await deleteDoc(doc(db, 'announcements', id));
              Alert.alert('Başarılı', 'Duyuru başarıyla silindi!');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Duyuru silme hatası:', error);
      Alert.alert('Hata', 'Duyuru silinirken bir hata oluştu!');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedAnnouncement) return;

    try {
      if (!editTitle.trim() || !editContent.trim()) {
        Alert.alert('Hata', 'Lütfen başlık ve içerik girin!');
        return;
      }

      const announcementRef = doc(db, 'announcements', selectedAnnouncement.id);
      await updateDoc(announcementRef, {
        title: editTitle.trim(),
        content: editContent.trim(),
        updatedAt: serverTimestamp()
      });

      setEditModalVisible(false);
      Alert.alert('Başarılı', 'Duyuru başarıyla güncellendi!');
    } catch (error) {
      console.error('Duyuru güncelleme hatası:', error);
      Alert.alert('Hata', 'Duyuru güncellenirken bir hata oluştu!');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setRefreshing(false);
    setLoading(false);
  }, []);

  const renderItem = ({ item }: { item: Announcement }) => (
    <View style={styles.announcementItem}>
      <View style={styles.announcementHeader}>
        <Text style={styles.announcementTitle}>{item.title}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}>
            <Ionicons name="pencil-outline" size={24} color="#4c669f" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
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
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/admin/announcements/add')}>
              <Ionicons name="add-circle-outline" size={24} color="#4c669f" />
            </TouchableOpacity>
          </View>

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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz duyuru bulunmuyor</Text>
              </View>
            }
          />
        </LinearGradient>
      </View>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setEditModalVisible(false)}>
                <Ionicons name="arrow-back" size={24} color="#4c669f" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Duyuruyu Düzenle</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Başlık</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Duyuru başlığı"
                  value={editTitle}
                  onChangeText={setEditTitle}
                  maxLength={100}
                />

                <Text style={styles.label}>İçerik</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Duyuru içeriği"
                  value={editContent}
                  onChangeText={setEditContent}
                  multiline
                  numberOfLines={8}
                  maxLength={1000}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}>
                <Text style={styles.modalButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
    justifyContent: 'space-between',
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
  addButton: {
    marginLeft: 15,
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
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  announcementContent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  announcementDate: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
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
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalBackButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4c669f',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
  },
}); 