import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    announcements: false,
    apartment: false,
    user: false,
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
          <Text style={styles.headerTitle}>Yönetici Paneli</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => router.replace('/')}>
            <Ionicons name="log-out-outline" size={24} color="#4c669f" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Duyuru Yönetimi */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('announcements')}>
              <View style={styles.sectionHeaderContent}>
                <Ionicons name="megaphone-outline" size={24} color="#4c669f" />
                <Text style={styles.sectionTitle}>Duyuru Yönetimi</Text>
              </View>
              <Ionicons
                name={expandedSections.announcements ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#4c669f"
              />
            </TouchableOpacity>
            {expandedSections.announcements && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigation('/admin/announcements/add')}>
                  <Ionicons name="add-circle-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Duyuru Ekle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Daire Yönetimi */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('apartment')}>
              <View style={styles.sectionHeaderContent}>
                <Ionicons name="home-outline" size={24} color="#4c669f" />
                <Text style={styles.sectionTitle}>Daire Yönetimi</Text>
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
                  onPress={() => handleNavigation('/admin/apartment/add')}>
                  <Ionicons name="add-circle-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Daire Ekle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigation('/admin/apartment/list')}>
                  <Ionicons name="list-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Daireleri Listele</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Kullanıcı Yönetimi */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('user')}>
              <View style={styles.sectionHeaderContent}>
                <Ionicons name="people-outline" size={24} color="#4c669f" />
                <Text style={styles.sectionTitle}>Kullanıcı Yönetimi</Text>
              </View>
              <Ionicons
                name={expandedSections.user ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#4c669f"
              />
            </TouchableOpacity>
            {expandedSections.user && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigation('/admin/user/add')}>
                  <Ionicons name="add-circle-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Kullanıcı Ekle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigation('/admin/user/list')}>
                  <Ionicons name="list-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Kullanıcıları Listele</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Aidat Yönetimi */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('dues')}>
              <View style={styles.sectionHeaderContent}>
                <Ionicons name="cash-outline" size={24} color="#4c669f" />
                <Text style={styles.sectionTitle}>Aidat Yönetimi</Text>
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
                  onPress={() => handleNavigation('/admin/dues/add')}>
                  <Ionicons name="add-circle-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Aidat Ekle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigation('/admin/dues/list')}>
                  <Ionicons name="list-outline" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Aidatları Listele</Text>
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
                  onPress={() => handleNavigation('/admin/weather')}>
                  <Ionicons name="cloud-outline" size={24} color="#fff" />
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