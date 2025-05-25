import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { getWeatherData } from '@/services/weatherService';

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export default function Weather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const data = await getWeatherData();
      setWeatherData(data);
      setError(null);
    } catch (err) {
      setError('Hava durumu bilgisi alınamadı.');
      console.error('Hava durumu verisi alınırken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case '01d':
      case '01n':
        return 'sunny';
      case '02d':
      case '02n':
        return 'partly-sunny';
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return 'cloudy';
      case '09d':
      case '09n':
        return 'rainy';
      case '10d':
      case '10n':
        return 'thunderstorm';
      case '11d':
      case '11n':
        return 'thunderstorm';
      case '13d':
      case '13n':
        return 'snow';
      case '50d':
      case '50n':
        return 'water';
      default:
        return 'partly-sunny';
    }
  };

  const getWeatherColor = (icon: string): readonly [string, string] => {
    switch (icon) {
      case '01d':
      case '01n':
        return ['#FFD700', '#FFA500'] as const;
      case '02d':
      case '02n':
        return ['#87CEEB', '#4682B4'] as const;
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return ['#B0C4DE', '#708090'] as const;
      case '09d':
      case '09n':
        return ['#4169E1', '#000080'] as const;
      case '10d':
      case '10n':
        return ['#1E90FF', '#0000CD'] as const;
      case '11d':
      case '11n':
        return ['#483D8B', '#191970'] as const;
      case '13d':
      case '13n':
        return ['#F0F8FF', '#E0FFFF'] as const;
      case '50d':
      case '50n':
        return ['#F5F5F5', '#DCDCDC'] as const;
      default:
        return [theme.colors.primary, theme.colors.secondary] as const;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hava Durumu</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchWeatherData}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchWeatherData}>
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : weatherData ? (
            <View style={styles.weatherContainer}>
              <LinearGradient
                colors={getWeatherColor(weatherData.icon)}
                style={styles.weatherCard}>
                <View style={styles.weatherHeader}>
                  <View style={styles.weatherInfo}>
                    <View style={styles.weatherTitleContainer}>
                      <Ionicons 
                        name={getWeatherIcon(weatherData.icon)} 
                        size={32} 
                        color="#fff" 
                        style={styles.weatherIcon} 
                      />
                      <Text style={styles.weatherTitle}>
                        {Math.round(weatherData.temperature)}°C
                      </Text>
                    </View>
                    <Text style={styles.weatherDescription}>
                      {weatherData.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.weatherDetailsContainer}>
                  <View style={styles.weatherDetail}>
                    <Ionicons name="water-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.weatherDetailText}>
                      Nem: %{weatherData.humidity}
                    </Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Ionicons name="speedometer-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={styles.weatherDetailText}>
                      Rüzgar: {weatherData.windSpeed} km/s
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ) : null}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  weatherContainer: {
    gap: 15,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    marginRight: 8,
  },
  weatherTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  weatherDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  weatherDetailsContainer: {
    marginTop: 12,
    gap: 8,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherDetailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
}); 