import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WeatherForecast() {
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
          <Text style={[styles.headerTitle, { color: '#333' }]}>Hava Durumu</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.currentWeather}>
            <View style={styles.weatherInfo}>
              <Ionicons name="partly-sunny" size={64} color="#4c669f" />
              <Text style={styles.temperature}>18°C</Text>
              <Text style={styles.condition}>Parçalı Bulutlu</Text>
              <Text style={styles.location}>İstanbul</Text>
            </View>
          </View>

          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>5 Günlük Tahmin</Text>
            <View style={styles.forecastList}>
              <View style={styles.forecastItem}>
                <Text style={styles.day}>Pzt</Text>
                <Ionicons name="sunny" size={32} color="#4c669f" />
                <Text style={styles.temp}>20°C</Text>
              </View>
              <View style={styles.forecastItem}>
                <Text style={styles.day}>Sal</Text>
                <Ionicons name="partly-sunny" size={32} color="#4c669f" />
                <Text style={styles.temp}>19°C</Text>
              </View>
              <View style={styles.forecastItem}>
                <Text style={styles.day}>Çar</Text>
                <Ionicons name="rainy" size={32} color="#4c669f" />
                <Text style={styles.temp}>16°C</Text>
              </View>
              <View style={styles.forecastItem}>
                <Text style={styles.day}>Per</Text>
                <Ionicons name="cloudy" size={32} color="#4c669f" />
                <Text style={styles.temp}>17°C</Text>
              </View>
              <View style={styles.forecastItem}>
                <Text style={styles.day}>Cum</Text>
                <Ionicons name="sunny" size={32} color="#4c669f" />
                <Text style={styles.temp}>21°C</Text>
              </View>
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
  currentWeather: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
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
  weatherInfo: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  condition: {
    fontSize: 20,
    color: '#666',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  forecastContainer: {
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
  forecastTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  forecastList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastItem: {
    alignItems: 'center',
  },
  day: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  temp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4c669f',
    marginTop: 10,
  },
}); 