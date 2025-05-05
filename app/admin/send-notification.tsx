import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { router } from 'expo-router';

export default function SendNotification() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSendNotification = async () => {
    if (!title || !message) {
      Alert.alert('Hata', 'Lütfen başlık ve mesaj girin.');
      return;
    }

    try {
      // Tüm kullanıcılara bildirim gönder
      const usersSnapshot = await db.collection('users').where('userType', '==', 'user').get();
      
      const batch = db.batch();
      const notificationsRef = db.collection('notifications');

      usersSnapshot.docs.forEach(userDoc => {
        const notificationRef = notificationsRef.doc();
        batch.set(notificationRef, {
          userId: userDoc.id,
          title,
          message,
          read: false,
          createdAt: serverTimestamp(),
        });
      });

      await batch.commit();
      
      Alert.alert('Başarılı', 'Bildirim başarıyla gönderildi.');
      router.back();
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
      Alert.alert('Hata', 'Bildirim gönderilirken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Bildirim Gönder</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Başlık"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Mesaj"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleSendNotification}>
        <Text style={styles.buttonText}>Bildirim Gönder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 