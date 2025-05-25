import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, ImageStyle, ViewStyle, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { db } from '../../../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export default function AddApartment() {
  const [no, setNo] = useState('');
  const [floor, setFloor] = useState('');
  const [block, setBlock] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!no || !floor || !block || !owner || !phone || !email) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
      return;
    }

    setLoading(true);
    try {
      // Önce e-posta ile kullanıcıyı bul
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Hata', 'Bu e-posta adresine sahip kullanıcı bulunamadı!');
        setLoading(false);
        return;
      }

      const userId = querySnapshot.docs[0].id;

      // Daireyi ekle
      const apartmentRef = await addDoc(collection(db, 'apartments'), {
        no,
        floor,
        block,
        owner,
        phone,
        email,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Mevcut aidatları bul ve yeni daireye uygula
      const duesRef = collection(db, 'dues');
      const duesQuery = query(duesRef, where('apartmentId', '==', 'all'));
      const duesSnapshot = await getDocs(duesQuery);

      if (!duesSnapshot.empty) {
        const duesPromises = duesSnapshot.docs.map(doc => {
          const dueData = doc.data();
          return addDoc(collection(db, 'dues'), {
            ...dueData,
            apartmentId: apartmentRef.id,
            apartmentNo: no,
            status: 'Beklemede',
            createdAt: serverTimestamp()
          });
        });

        await Promise.all(duesPromises);
      }

      setLoading(false);
      Alert.alert('Başarılı', 'Daire başarıyla eklendi!', [
        { text: 'Tamam', onPress: () => router.replace('/admin/apartments/list' as any) }
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Hata', 'Daire eklenirken bir hata oluştu!');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../../assets/images/logo1.jpg')} style={styles.logoImage} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Daire Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="Daire No"
              placeholderTextColor={theme.colors.gray[400]}
              value={no}
              onChangeText={setNo}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Kat"
              placeholderTextColor={theme.colors.gray[400]}
              value={floor}
              onChangeText={setFloor}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Blok"
              placeholderTextColor={theme.colors.gray[400]}
              value={block}
              onChangeText={setBlock}
            />
            <TextInput
              style={styles.input}
              placeholder="Sahibi"
              placeholderTextColor={theme.colors.gray[400]}
              value={owner}
              onChangeText={setOwner}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefon"
              placeholderTextColor={theme.colors.gray[400]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              placeholderTextColor={theme.colors.gray[400]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title={loading ? 'Ekleniyor...' : 'Daire Ekle'}
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
            <Button
              title="İptal"
              variant="outline"
              size="large"
              fullWidth
              onPress={() => router.back()}
              style={styles.saveButton}
            />
          </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.soft,
    marginBottom: 8,
  } as ViewStyle,
  logoImage: {
    width: 100,
    height: 100,
  } as ImageStyle,
  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.background.light,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  saveButton: {
    marginTop: 8,
  },
}); 