import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

export default function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const API_KEY = '34b11265023312c3aa896dde847b3cc7';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=38.6810&lon=39.2264&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.cod === '404') {
        setError('Şehir bulunamadı');
        setLoading(false);
        return;
      }

      if (data.cod === '401') {
        setError('API anahtarı geçersiz');
        setLoading(false);
        return;
      }

      if (!data.main || !data.weather || !data.wind) {
        console.log('API Yanıtı:', data); // API yanıtını kontrol etmek için
        setError('Hava durumu verisi alınamadı');
        setLoading(false);
        return;
      }

      setWeather(data);
      setLoading(false);
    } catch (err) {
      console.error('Hava durumu hatası:', err);
      setError('Hava durumu bilgisi alınamadı');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f5f5f5', '#f0f0f0']}
        style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Elazığ Hava Durumu</Text>
        </View>

        <View style={styles.weatherContainer}>
          {weather && (
            <>
              <View style={styles.temperatureContainer}>
                <Ionicons name="thermometer-outline" size={48} color="#4c669f" />
                <Text style={styles.temperature}>
                  {Math.round(weather.main.temp)}°C
                </Text>
                <Text style={styles.feelsLike}>
                  Hissedilen: {Math.round(weather.main.feels_like)}°C
                </Text>
              </View>

              <View style={styles.weatherInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="water-outline" size={24} color="#4c669f" />
                  <Text style={styles.infoText}>
                    Nem: {weather.main.humidity}%
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="speedometer-outline" size={24} color="#4c669f" />
                  <Text style={styles.infoText}>
                    Rüzgar: {weather.wind.speed} m/s
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="partly-sunny-outline" size={24} color="#4c669f" />
                  <Text style={styles.infoText}>
                    {weather.weather[0].description}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  weatherContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperatureContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4c669f',
    marginTop: 10,
  },
  feelsLike: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  weatherInfo: {
    width: '100%',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
}); 