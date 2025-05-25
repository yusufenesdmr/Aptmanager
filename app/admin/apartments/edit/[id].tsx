import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, ImageStyle, ViewStyle, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { db } from '../../../config/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function EditApartment() {
  const { id } = useLocalSearchParams();
  const [no, setNo] = useState('');
  const [floor, setFloor] = useState('');
  const [block, setBlock] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchApartment = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'apartments', String(id));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setNo(data.no || '');
          setFloor(data.floor || '');
          setBlock(data.block || '');
          setOwner(data.owner || '');
          setPhone(data.phone || '');
        } else {
          Alert.alert('Hata', 'Daire bulunamadı!');
          router.replace('/admin/apartments/list' as any);
        }
      } catch (e) {
        Alert.alert('Hata', 'Daire bilgisi alınamadı!');
        router.replace('/admin/apartments/list' as any);
      }
      setLoading(false);
    };
    fetchApartment();
  }, [id]);

  const handleSave = async () => {
    if (!no || !floor || !block || !owner || !phone) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
      return;
    }
    setSaving(true);
    try {
      const ref = doc(db, 'apartments', String(id));
      await updateDoc(ref, { no, floor, block, owner, phone });
      setSaving(false);
      Alert.alert('Başarılı', 'Daire başarıyla güncellendi!', [
        { text: 'Tamam', onPress: () => router.replace('/admin/apartments/list' as any) }
      ]);
    } catch (e) {
      setSaving(false);
      Alert.alert('Hata', 'Daire güncellenirken bir hata oluştu!');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Daire Sil', 'Bu daireyi silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await deleteDoc(doc(db, 'apartments', id));
          Alert.alert('Başarılı', 'Daire başarıyla silindi!');
          router.replace('/admin/apartments/list' as any);
        } catch (e) {
          Alert.alert('Hata', 'Daire silinirken bir hata oluştu!');
        }
      }}
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../../../assets/images/logo1.jpg')} style={styles.logoImage} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.formContainer}>
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
            <Button
              title={saving ? 'Kaydediliyor...' : 'Kaydet'}
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSave}
              loading={saving}
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
            <TouchableOpacity onPress={() => handleDelete(String(id))} style={styles.deleteTextContainer}>
              <Text style={styles.deleteText}>Daireyi Sil</Text>
            </TouchableOpacity>
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
  content: {
    justifyContent: 'flex-start',
    padding: 24,
    paddingBottom: 40,
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
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
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
  deleteTextContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  deleteText: {
    color: theme.colors.error,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
}); 