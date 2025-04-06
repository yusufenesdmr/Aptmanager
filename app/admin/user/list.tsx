import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

// Örnek kullanıcı verileri
const users = [
  { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@example.com', phone: '555-123-4567', apartmentNo: '101' },
  { id: 2, name: 'Mehmet Demir', email: 'mehmet@example.com', phone: '555-234-5678', apartmentNo: '102' },
  { id: 3, name: 'Ayşe Kaya', email: 'ayse@example.com', phone: '555-345-6789', apartmentNo: '201' },
  { id: 4, name: 'Fatma Şahin', email: 'fatma@example.com', phone: '555-456-7890', apartmentNo: '202' },
];

export default function UserList() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kullanıcı Listesi</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {users.map((user) => (
            <View key={user.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{user.name}</Text>
                <Text style={styles.cardSubtitle}>
                  Daire No: {user.apartmentNo}
                </Text>
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>
                  <Text style={styles.label}>E-posta:</Text> {user.email}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.label}>Telefon:</Text> {user.phone}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}>
                  <Text style={styles.actionButtonText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}>
                  <Text style={styles.actionButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  backButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  cardHeader: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  cardContent: {
    marginBottom: 15,
  },
  cardText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 