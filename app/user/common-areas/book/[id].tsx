import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { db } from '../../../../config/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CommonArea {
  id: string;
  name: string;
  type: string;
  capacity: number;
  currentBookings: number;
}

export default function BookArea() {
  const { id } = useLocalSearchParams();
  const [area, setArea] = useState<CommonArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const fetchArea = async () => {
    try {
      const areaRef = doc(db, 'commonAreas', id as string);
      const areaDoc = await getDoc(areaRef);
      if (!areaDoc.exists()) {
        Alert.alert('Hata', 'Alan bulunamadı.');
        router.back();
        return;
      }
      setArea({ id: areaDoc.id, ...areaDoc.data() } as CommonArea);
    } catch (error) {
      console.error('Alan bilgileri yüklenirken hata:', error);
      Alert.alert('Hata', 'Alan bilgileri yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArea();
  }, [id]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  const handleSubmit = async () => {
    if (!area) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Hata', 'Lütfen giriş yapın.');
      return;
    }

    if (area.currentBookings >= area.capacity) {
      Alert.alert('Hata', 'Bu alan şu anda dolu.');
      return;
    }

    setSubmitting(true);
    try {
      // Rezervasyonu ekle
      const bookingsRef = collection(db, 'commonAreas', id as string, 'bookings');
      await addDoc(bookingsRef, {
        userId: user.uid,
        date: date.toISOString().split('T')[0],
        startTime: startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        endTime: endTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // Mevcut rezervasyon sayısını güncelle
      const areaRef = doc(db, 'commonAreas', id as string);
      await updateDoc(areaRef, {
        currentBookings: area.currentBookings + 1,
      });

      Alert.alert('Başarılı', 'Rezervasyon talebiniz alındı.');
      router.back();
    } catch (error) {
      console.error('Rezervasyon yapılırken hata:', error);
      Alert.alert('Hata', 'Rezervasyon yapılırken bir sorun oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>
            {area?.name} - Rezervasyon
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tarih:</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateTimeText}>
                  {date.toLocaleDateString('tr-TR')}
                </Text>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Başlangıç Saati:</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowStartTimePicker(true)}>
                <Text style={styles.dateTimeText}>
                  {startTime.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Ionicons name="time" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bitiş Saati:</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndTimePicker(true)}>
                <Text style={styles.dateTimeText}>
                  {endTime.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Ionicons name="time" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Rezervasyon Yap</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={handleStartTimeChange}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="default"
            onChange={handleEndTimeChange}
          />
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 