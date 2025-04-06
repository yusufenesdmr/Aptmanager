import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

// Örnek daire verileri
const apartments = [
  { id: 1, no: '101', floor: '1', block: 'A', owner: 'Ahmet Yılmaz', phone: '555-123-4567' },
  { id: 2, no: '102', floor: '1', block: 'A', owner: 'Mehmet Demir', phone: '555-234-5678' },
  { id: 3, no: '201', floor: '2', block: 'A', owner: 'Ayşe Kaya', phone: '555-345-6789' },
  { id: 4, no: '202', floor: '2', block: 'A', owner: 'Fatma Şahin', phone: '555-456-7890' },
];

export default function ApartmentList() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daire Listesi</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {apartments.map((apartment) => (
            <View key={apartment.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Daire {apartment.no}</Text>
                <Text style={styles.cardSubtitle}>
                  {apartment.floor}. Kat - {apartment.block} Blok
                </Text>
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>
                  <Text style={styles.label}>Sahibi:</Text> {apartment.owner}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.label}>Telefon:</Text> {apartment.phone}
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