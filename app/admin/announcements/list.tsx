import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Aidat Ödemeleri Hakkında',
      content: 'Bu ayki aidat ödemeleri 15 Mart tarihine kadar yapılacaktır.',
      date: '2024-03-01',
      isImportant: true,
    },
    {
      id: '2',
      title: 'Asansör Bakımı',
      content: 'Yarın asansör bakımı yapılacaktır. Lütfen dikkatli olunuz.',
      date: '2024-03-05',
      isImportant: false,
    },
  ]);

  const handleAdd = () => {
    router.push('/admin/announcements/add');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/announcements/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
  };

  const renderItem = ({ item }: { item: Announcement }) => (
    <View style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <Text style={styles.announcementTitle}>{item.title}</Text>
        {item.isImportant && (
          <View style={styles.importantBadge}>
            <Text style={styles.importantText}>Önemli</Text>
          </View>
        )}
      </View>
      <Text style={styles.announcementContent}>{item.content}</Text>
      <View style={styles.announcementFooter}>
        <Text style={styles.announcementDate}>{item.date}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(item.id)}>
            <Ionicons name="create-outline" size={20} color="#4c669f" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Duyuru Yönetimi</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}>
            <Ionicons name="add" size={24} color="#4c669f" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={announcements}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
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
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 5,
  },
  listContainer: {
    padding: 20,
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
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
  importantBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 10,
  },
  importantText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  announcementContent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementDate: {
    fontSize: 14,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
}); 