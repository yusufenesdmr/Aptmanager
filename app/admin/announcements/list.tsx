import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate().toLocaleDateString('tr-TR') || '',
      })) as Announcement[];
      setAnnouncements(data);
      setLoading(false);
    }, (error) => {
      console.error("Duyurular çekilirken hata oluştu:", error);
      setLoading(false);
      Alert.alert('Hata', 'Duyurular yüklenirken bir sorun oluştu.');
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    router.push('/admin/announcements/add' as any);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/announcements/edit/${id}` as any);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Silme Uyarısı', 'Bu duyuruyu silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { 
        text: 'Sil', 
        style: 'destructive', 
        onPress: async () => {
          try {
            console.log('Silme işlemi başlatıldı, ID:', id);
            const docRef = doc(db, 'announcements', id);
            console.log('Doküman referansı oluşturuldu:', docRef);
            await deleteDoc(docRef);
            console.log('Doküman başarıyla silindi');
            Alert.alert('Başarılı', 'Duyuru başarıyla silindi.');
          } catch (error) {
            console.error('Silme hatası detayları:', error);
            Alert.alert('Hata', 'Duyuru silinirken bir sorun oluştu. Lütfen tekrar deneyin.');
          }
        }
      },
    ]);
  };

  const renderItem = ({ item }: { item: Announcement }) => (
    <TouchableOpacity onPress={() => handleEdit(item.id)}>
      <View style={[
        styles.announcementCard,
        item.isImportant && styles.importantCard
      ]}>
        <View style={styles.announcementHeader}>
          <Text style={[
            styles.announcementTitle,
            item.isImportant && styles.importantTitle
          ]}>{item.title}</Text>
          {item.isImportant && (
            <View style={styles.importantBadge}>
              <Text style={styles.importantText}>Önemli</Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.announcementContent,
          item.isImportant && styles.importantContent
        ]}>{item.content}</Text>
        <View style={styles.announcementFooter}>
          <Text style={[
            styles.announcementDate,
            item.isImportant && styles.importantDate
          ]}>{item.date}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
              <Ionicons name="trash" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../../assets/images/logo1.jpg')} style={styles.logoImage} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.formContainer}>
            <Button
              title="+ Duyuru Ekle"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleAdd}
              style={styles.addButton}
            />
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
            ) : announcements.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz duyuru bulunmamaktadır.</Text>
              </View>
            ) : (
              <FlatList
                data={announcements}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  gradient: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.soft,
    marginBottom: 8,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    backgroundColor: theme.colors.background.light,
    borderRadius: 16,
    padding: 24,
    ...theme.shadows.sm,
  },
  addButton: {
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
  },
  list: {
    gap: 12,
  },
  announcementCard: {
    backgroundColor: theme.colors.background.soft,
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    width: '100%',
    ...theme.shadows.sm,
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
    color: theme.colors.text.light,
    flex: 1,
    marginRight: 10,
  },
  importantBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  importantText: {
    color: theme.colors.text.light,
    fontSize: 12,
    fontWeight: 'bold',
  },
  announcementContent: {
    fontSize: 16,
    color: theme.colors.text.light,
    marginBottom: 10,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementDate: {
    fontSize: 14,
    color: theme.colors.text.light,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    color: theme.colors.text.light,
    fontSize: 18,
    opacity: 0.7,
  },
  importantCard: {
    backgroundColor: theme.colors.background.soft,
    borderColor: theme.colors.background.soft,
    borderWidth: 1,
  },
  importantTitle: {
    color: theme.colors.text.light,
  },
  importantContent: {
    color: theme.colors.text.light,
  },
  importantDate: {
    color: theme.colors.text.light,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
}); 