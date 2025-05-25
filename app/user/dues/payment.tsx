import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

// API URL'ini environment'tan al
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// Stripe public key (pk_test_ ile başlayan)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RSPFUQhOuynHDYW4OQM7bgOfnB0mzu65rB6fZyWiuRqtVBaFut0NtwY6Tgbee0q3DS1617SsDyu5cNjTXe7lYWr00tU83neIY';

// Test modu
const TEST_MODE = true;

// Test kartları
const TEST_CARDS = {
  success: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2024,
    cvc: '123'
  },
  decline: {
    number: '4000000000000002',
    exp_month: 12,
    exp_year: 2024,
    cvc: '123'
  },
  authentication: {
    number: '4000000000003220',
    exp_month: 12,
    exp_year: 2024,
    cvc: '123'
  }
};

// Test hata mesajları
const TEST_ERRORS = {
  card_declined: {
    type: 'card_error',
    code: 'card_declined',
    decline_code: 'generic_decline',
    message: 'Kartınız reddedildi.',
    doc_url: 'https://docs.stripe.com/error-codes#card-declined'
  },
  authentication_required: {
    type: 'authentication_error',
    code: 'authentication_required',
    message: 'Bu işlem için 3D Secure doğrulaması gerekiyor.',
    doc_url: 'https://docs.stripe.com/error-codes#authentication-required'
  }
};

function PaymentScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [selectedCard, setSelectedCard] = useState<'success' | 'decline' | 'authentication'>('success');

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Kart bilgilerini kontrol et
      if (!cardNumber || !expiryDate || !cvc) {
        Alert.alert('Hata', 'Lütfen tüm kart bilgilerini girin.');
        setLoading(false);
        return;
      }

      // Test kartı seçimi
      const testCard = TEST_CARDS[selectedCard];
      
      // Kart bilgilerini test kartı ile karşılaştır
      if (cardNumber !== testCard.number || 
          expiryDate !== `${testCard.exp_month}/${testCard.exp_year}` || 
          cvc !== testCard.cvc) {
        Alert.alert('Hata', 'Geçersiz kart bilgileri. Lütfen test kartı bilgilerini kullanın.');
        setLoading(false);
        return;
      }

      // Ödeme simülasyonu
      if (selectedCard === 'success') {
        // Başarılı ödeme
        const dueRef = doc(db, 'dues', params.dueId as string);
        await updateDoc(dueRef, {
          status: 'Ödendi',
          paymentDate: new Date(),
          paymentMethod: 'Stripe'
        });

        // Başarılı mesajı göster
        Alert.alert(
          'Başarılı',
          'Ödeme işlemi başarıyla tamamlandı.',
          [
            {
              text: 'Tamam',
              onPress: () => {
                router.back();
              }
            }
          ]
        );
      } else if (selectedCard === 'decline') {
        // Reddedilen kart
        throw new Error('Kartınız reddedildi. Lütfen başka bir kart deneyin.');
      } else if (selectedCard === 'authentication') {
        // 3D Secure gerektiren kart
        throw new Error('Bu işlem için 3D Secure doğrulaması gerekiyor.');
      }

    } catch (error: any) {
      console.error('Ödeme hatası:', error);
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Ödeme Detayları</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dönem:</Text>
            <Text style={styles.detailValue}>{params.month}/{params.year}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tutar:</Text>
            <Text style={styles.detailValue}>
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY'
              }).format(Number(params.amount))}
            </Text>
          </View>

          <View style={styles.cardForm}>
            <Text style={styles.formLabel}>Kart Numarası</Text>
            <TextInput
              style={styles.input}
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={16}
            />

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.formLabel}>Son Kullanma Tarihi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12/24"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  maxLength={5}
                />
              </View>

              <View style={styles.column}>
                <Text style={styles.formLabel}>CVC</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvc}
                  onChangeText={setCvc}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>

            <View style={styles.testCards}>
              <Text style={styles.testCardsTitle}>Test Kartları:</Text>
              <TouchableOpacity
                style={[styles.testCardButton, selectedCard === 'success' && styles.selectedTestCard]}
                onPress={() => {
                  setSelectedCard('success');
                  setCardNumber(TEST_CARDS.success.number);
                  setExpiryDate(`${TEST_CARDS.success.exp_month}/${TEST_CARDS.success.exp_year}`);
                  setCvc(TEST_CARDS.success.cvc);
                }}>
                <Text style={styles.testCardText}>Başarılı Ödeme</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testCardButton, selectedCard === 'decline' && styles.selectedTestCard]}
                onPress={() => {
                  setSelectedCard('decline');
                  setCardNumber(TEST_CARDS.decline.number);
                  setExpiryDate(`${TEST_CARDS.decline.exp_month}/${TEST_CARDS.decline.exp_year}`);
                  setCvc(TEST_CARDS.decline.cvc);
                }}>
                <Text style={styles.testCardText}>Reddedilen Kart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testCardButton, selectedCard === 'authentication' && styles.selectedTestCard]}
                onPress={() => {
                  setSelectedCard('authentication');
                  setCardNumber(TEST_CARDS.authentication.number);
                  setExpiryDate(`${TEST_CARDS.authentication.exp_month}/${TEST_CARDS.authentication.exp_year}`);
                  setCvc(TEST_CARDS.authentication.cvc);
                }}>
                <Text style={styles.testCardText}>3D Secure</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Ödeme Yap</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default function Payment() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <PaymentScreen />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  paymentCard: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.gray[600],
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardForm: {
    marginTop: 20,
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  testCards: {
    marginTop: 20,
    marginBottom: 20,
  },
  testCardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  testCardButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedTestCard: {
    backgroundColor: '#4c669f',
  },
  testCardText: {
    color: '#333',
    textAlign: 'center',
  },
}); 