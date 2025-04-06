import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function AddDues() {
  const [apartmentNo, setApartmentNo] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!apartmentNo || !amount || !month || !year) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun!');
      return;
    }

    // Burada API'ye gönderme işlemi yapılacak
    Alert.alert('Başarılı', 'Aidat başarıyla eklendi!');
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aidat Ekle</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Daire No</Text>
            <TextInput
              style={styles.input}
              placeholder="Daire No"
              placeholderTextColor="#999"
              value={apartmentNo}
              onChangeText={setApartmentNo}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Tutar</Text>
            <TextInput
              style={styles.input}
              placeholder="Tutar"
              placeholderTextColor="#999"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Ay</Text>
            <TextInput
              style={styles.input}
              placeholder="Ay"
              placeholderTextColor="#999"
              value={month}
              onChangeText={setMonth}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Yıl</Text>
            <TextInput
              style={styles.input}
              placeholder="Yıl"
              placeholderTextColor="#999"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAdd}>
            <Text style={styles.buttonText}>Aidat Ekle</Text>
          </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    gap: 10,
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 