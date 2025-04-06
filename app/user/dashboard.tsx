import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UserDashboard() {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    apartment: false,
    dues: false,
    weather: false,
  });

  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
          {/* Daire Bilgileri */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('apartment')}>
              <View style={styles.sectionHeaderContent}>
                <Ionicons name="home-outline" size={24} color="#4c669f" />
                <Text style={styles.sectionTitle}>Daire Bilgileri</Text>
              </View>
              <Ionicons
                name={expandedSections.apartment ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#4c669f"
              />
            </TouchableOpacity>
            {expandedSections.apartment && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigation('/user/apartment/info')}>
                  <Ionicons name="information-circle-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Daire Bilgileri</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Aidat Ödemeleri */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('dues')}>
              <View style={styles.sectionHeaderContent}>
                <Ionicons name="cash-outline" size={24} color="#4c669f" />
                <Text style={styles.sectionTitle}>Aidat Ödemeleri</Text>
              </View>
              <Ionicons
                name={expandedSections.dues ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#4c669f"
              />
            </TouchableOpacity>
            {expandedSections.dues && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigation('/user/dues/payments')}>
                  <Ionicons name="card-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Aidat Ödemeleri</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Hava Durumu */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('weather')}>
              <View style={styles.sectionHeaderContent}>
                <Ionicons name="cloud-outline" size={24} color="#4c669f" />
                <Text style={styles.sectionTitle}>Hava Durumu</Text>
              </View>
              <Ionicons
                name={expandedSections.weather ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#4c669f"
              />
            </TouchableOpacity>
            {expandedSections.weather && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigation('/user/weather/forecast')}>
                  <Ionicons name="partly-sunny-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Hava Durumu</Text>
                </TouchableOpacity>
              </View>
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
  section: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4c669f',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 