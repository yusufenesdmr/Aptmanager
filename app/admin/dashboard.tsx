import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f5f5f5', '#f0f0f0']}
        style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yönetici Paneli</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => handleNavigation('/admin/announcements/list')}>
              <Ionicons name="notifications-outline" size={24} color="#4c669f" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => router.replace('/')}>
              <Ionicons name="log-out-outline" size={24} color="#4c669f" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.gridContainer}>
            {/* Ana Butonlar */}
            <View style={styles.mainButtonsContainer}>
              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => handleNavigation('/admin/apartments/list')}>
                <Ionicons name="business-outline" size={32} color="#fff" />
                <Text style={styles.mainButtonText}>Daire Yönetimi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => handleNavigation('/admin/dues/list')}>
                <Ionicons name="cash-outline" size={32} color="#fff" />
                <Text style={styles.mainButtonText}>Aidat Yönetimi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => handleNavigation('/admin/announcements/list')}>
                <Ionicons name="megaphone-outline" size={32} color="#fff" />
                <Text style={styles.mainButtonText}>Duyuru Yönetimi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => handleNavigation('/admin/complaints/list')}>
                <Ionicons name="alert-circle-outline" size={32} color="#fff" />
                <Text style={styles.mainButtonText}>Şikayet Yönetimi</Text>
              </TouchableOpacity>
            </View>

            {/* Alt Sekmeler */}
            <View style={styles.subButtonsContainer}>
              <TouchableOpacity
                style={styles.subButton}
                onPress={() => handleNavigation('/admin/visitors/list')}>
                <Ionicons name="people-outline" size={24} color="#4c669f" />
                <Text style={styles.subButtonText}>Ziyaretçi Yönetimi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subButton}
                onPress={() => handleNavigation('/admin/reports')}>
                <Ionicons name="bar-chart-outline" size={24} color="#4c669f" />
                <Text style={styles.subButtonText}>Raporlar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subButton}
                onPress={() => handleNavigation('/admin/settings')}>
                <Ionicons name="settings-outline" size={24} color="#4c669f" />
                <Text style={styles.subButtonText}>Ayarlar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subButton}
                onPress={() => handleNavigation('/admin/help')}>
                <Ionicons name="help-circle-outline" size={24} color="#4c669f" />
                <Text style={styles.subButtonText}>Yardım</Text>
              </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  notificationButton: {
    padding: 10,
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  gridContainer: {
    gap: 20,
  },
  mainButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  mainButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#4c669f',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  subButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  subButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  subButtonText: {
    color: '#4c669f',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
}); 