import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UserDashboard() {
  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f5f5f5', '#f0f0f0']}
        style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kullanıcı Paneli</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => handleNavigation('/user/announcements/list')}>
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
                onPress={() => handleNavigation('/user/apartment/info')}>
                <Ionicons name="home-outline" size={32} color="#fff" />
                <Text style={styles.mainButtonText}>Daire Bilgileri</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => handleNavigation('/user/dues/payments')}>
                <Ionicons name="cash-outline" size={32} color="#fff" />
                <Text style={styles.mainButtonText}>Aidat Ödemeleri</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => handleNavigation('/user/weather/forecast')}>
                <Ionicons name="cloud-outline" size={32} color="#fff" />
                <Text style={styles.mainButtonText}>Hava Durumu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => handleNavigation('/user/complaints')}>
                <Ionicons name="alert-circle-outline" size={32} color="#fff" />
                <Text style={styles.mainButtonText}>Şikayetlerim</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => handleNavigation('/user/help')}>
                <Ionicons name="help-circle-outline" size={32} color="#fff" />
                <Text style={styles.mainButtonText}>Yardım Merkezi</Text>
              </TouchableOpacity>
            </View>

            {/* Alt Sekmeler */}
            <View style={styles.subButtonsContainer}>
              <TouchableOpacity
                style={styles.subButton}
                onPress={() => handleNavigation('/user/announcements/list')}>
                <Ionicons name="megaphone-outline" size={24} color="#4c669f" />
                <Text style={styles.subButtonText}>Duyurular</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subButton}
                onPress={() => handleNavigation('/user/visitors/list')}>
                <Ionicons name="people-outline" size={24} color="#4c669f" />
                <Text style={styles.subButtonText}>Ziyaretçiler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subButton}
                onPress={() => handleNavigation('/user/settings')}>
                <Ionicons name="settings-outline" size={24} color="#4c669f" />
                <Text style={styles.subButtonText}>Ayarlar</Text>
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