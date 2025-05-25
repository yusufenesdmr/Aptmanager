import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type AdminRoute = '/admin/chat' | '/admin/apartments' | '/admin/users' | '/admin/announcements';

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: AdminRoute;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  backgroundImageStyle: {
    opacity: 0.1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#4CAF50',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  menuItem: {
    width: '48%',
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
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

const AdminIndex: React.FC = () => {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      title: 'Mesajlar',
      description: 'Kullanıcılarla iletişim',
      icon: 'chatbubbles',
      color: '#4CAF50',
      route: '/admin/chat',
    },
    {
      title: 'Daireler',
      description: 'Daire yönetimi',
      icon: 'home',
      color: '#2196F3',
      route: '/admin/apartments',
    },
    {
      title: 'Kullanıcılar',
      description: 'Kullanıcı yönetimi',
      icon: 'people',
      color: '#FF9800',
      route: '/admin/users',
    },
    {
      title: 'Duyurular',
      description: 'Duyuru yönetimi',
      icon: 'megaphone',
      color: '#9C27B0',
      route: '/admin/announcements',
    },
  ];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/logo1.jpg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
          style={styles.gradient}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Yönetici Paneli</Text>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.menuGrid}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => router.push(item.route as any)}>
                  <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon as any} size={24} color="#fff" />
                  </View>
                  <Text style={styles.menuText}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default AdminIndex; 