import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

// Örnek aidat verileri
const dues = [
  { id: 1, apartmentNo: '101', amount: '500', month: '1', year: '2024', description: 'Ocak ayı aidatı', status: 'Ödendi' },
  { id: 2, apartmentNo: '102', amount: '500', month: '1', year: '2024', description: 'Ocak ayı aidatı', status: 'Ödendi' },
  { id: 3, apartmentNo: '201', amount: '500', month: '1', year: '2024', description: 'Ocak ayı aidatı', status: 'Beklemede' },
  { id: 4, apartmentNo: '202', amount: '500', month: '1', year: '2024', description: 'Ocak ayı aidatı', status: 'Beklemede' },
];

export default function DuesList() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aidat Listesi</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {dues.map((due) => (
            <View key={due.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Daire {due.apartmentNo}</Text>
                <Text style={[styles.status, due.status === 'Ödendi' ? styles.paid : styles.pending]}>
                  {due.status}
                </Text>
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>
                  <Text style={styles.label}>Tutar:</Text> {due.amount} TL
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.label}>Dönem:</Text> {due.month}/{due.year}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.label}>Açıklama:</Text> {due.description}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  status: {
    padding: 5,
    borderRadius: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  paid: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    color: '#00ff00',
  },
  pending: {
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
    color: '#ffff00',
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