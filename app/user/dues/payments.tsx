import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DuesPayments() {
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
          <Text style={[styles.headerTitle, { color: '#333' }]}>Aidat Ödemeleri</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <View>
                <Text style={styles.month}>Ocak 2024</Text>
                <Text style={styles.status}>Ödendi</Text>
              </View>
              <Text style={styles.amount}>500 TL</Text>
            </View>
            <View style={styles.paymentRow}>
              <View>
                <Text style={styles.month}>Şubat 2024</Text>
                <Text style={styles.status}>Ödendi</Text>
              </View>
              <Text style={styles.amount}>500 TL</Text>
            </View>
            <View style={styles.paymentRow}>
              <View>
                <Text style={styles.month}>Mart 2024</Text>
                <Text style={[styles.status, { color: '#ff6b6b' }]}>Bekliyor</Text>
              </View>
              <Text style={styles.amount}>500 TL</Text>
            </View>
          </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  month: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 5,
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4c669f',
  },
}); 