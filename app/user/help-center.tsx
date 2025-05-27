import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Message {
  from: 'user' | 'bot';
  text: string;
  actions?: { label: string; route: string }[];
}

const BOT_INTRO = {
  from: 'bot' as const,
  text: 'Merhaba! Ben AptManager Yardım Merkezi. Uygulama ile ilgili sorularınızı bana yazabilirsiniz. Size nasıl yardımcı olabilirim?',
  actions: [
    { label: 'Aidat Ödemeleri', route: '/user/dues/payments' },
    { label: 'Ortak Alanlar', route: '/user/common-areas' },
    { label: 'Şikayet Bildir', route: '/user/complaints' },
    { label: 'Duyurular', route: '/user/announcements/list' },
    { label: 'Profilim', route: '/user/settings' },
  ],
};

function getBotResponse(input: string, dues?: any[]): Message {
  const lower = input.toLowerCase();
  if (lower.includes('aidat') && (lower.includes('ödemelerim') || lower.includes('borcum') || lower.includes('geçmişim') || lower.includes('durum'))) {
    if (dues && dues.length > 0) {
      const list = dues.map((d, i) => `• ${d.month || ''} ${d.year || ''} - ${d.status === 'paid' ? 'Ödendi' : 'Bekliyor'}${d.amount ? ` (${d.amount}₺)` : ''}`).join('\n');
      return {
        from: 'bot' as const,
        text: `Aidat ödemeleriniz:\n${list}`,
      };
    } else {
      return {
        from: 'bot' as const,
        text: 'Kayıtlı aidat ödemeniz bulunamadı.',
      };
    }
  }
  if (lower.includes('ortak alan')) {
    return {
      from: 'bot' as const,
      text: 'Ortak alanları görüntüleyebilir ve rezervasyon yapabilirsiniz.',
      actions: [
        { label: 'Ortak Alanlar', route: '/user/common-areas' },
      ],
    };
  }
  if (lower.includes('şikayet') || lower.includes('sorun')) {
    return {
      from: 'bot' as const,
      text: 'Şikayetlerinizi buradan iletebilirsiniz.',
      actions: [
        { label: 'Şikayet Bildir', route: '/user/complaints' },
      ],
    };
  }
  if (lower.includes('duyuru')) {
    return {
      from: 'bot' as const,
      text: 'Duyuruları buradan görebilirsiniz.',
      actions: [
        { label: 'Duyurular', route: '/user/announcements' },
      ],
    };
  }
  if (lower.includes('profil') || lower.includes('bilgi') || lower.includes('şifre')) {
    return {
      from: 'bot' as const,
      text: 'Profil bilgilerinizi buradan güncelleyebilirsiniz.',
      actions: [
        { label: 'Profilim', route: '/user/settings' },
      ],
    };
  }
  if (lower.includes('hava durumu')) {
    return {
      from: 'bot' as const,
      text: 'Hava durumu tahminlerini buradan görebilirsiniz.',
      actions: [
        { label: 'Hava Durumu', route: '/user/weather/forecast' },
      ],
    };
  }
  return {
    from: 'bot' as const,
    text: 'Üzgünüm, bu konuda yardımcı olamıyorum. Lütfen uygulama ile ilgili bir konu hakkında soru sorun veya aşağıdaki seçeneklerden birini seçin.',
    actions: BOT_INTRO.actions,
  };
}

export default function HelpCenter() {
  const [messages, setMessages] = useState<Message[]>([BOT_INTRO]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      // Önce uygulama içi özel cevaplar (aidat, yönlendirme) kontrolü
      const lower = input.toLowerCase();
      if (lower.includes('aidat') && (lower.includes('ödemelerim') || lower.includes('borcum') || lower.includes('geçmişim') || lower.includes('durum'))) {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user?.email) {
          setMessages((prev) => [...prev, { from: 'bot', text: 'Kullanıcı e-posta bilgisi bulunamadı.' }]);
          setLoading(false);
          return;
        }
        const apartmentsRef = collection(db, 'apartments');
        const apartmentQuery = query(apartmentsRef, where('email', '==', user.email));
        const apartmentSnapshot = await getDocs(apartmentQuery);
        if (apartmentSnapshot.empty) {
          setMessages((prev) => [...prev, { from: 'bot', text: 'Size atanmış bir daire bulunamadı. Lütfen tekrar giriş yapın.' }]);
          setLoading(false);
          setTimeout(() => {
            router.push('/user/login');
          }, 1500);
          return;
        }
        const apartmentId = apartmentSnapshot.docs[0].id;
        const duesRef = collection(db, 'dues');
        const duesQuery = query(duesRef, where('apartmentId', '==', apartmentId));
        const duesSnapshot = await getDocs(duesQuery);
        const dues = duesSnapshot.docs.map(doc => doc.data());
        const botMsg = getBotResponse(input, dues);
        setMessages((prev) => [...prev, botMsg]);
        setLoading(false);
        return;
      }
      // Diğer tüm mesajlar için Gemini API'ye gönder
      const res = await fetch('http://localhost:3000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { from: 'bot', text: data.text }]);
    } catch (e) {
      setMessages((prev) => [...prev, { from: 'bot', text: 'AI cevabı alınamadı.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yardım Merkezi</Text>
        </View>
        <ScrollView
          style={styles.messages}
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => (
            <View key={i} style={[styles.message, msg.from === 'user' ? styles.userMsg : styles.botMsg]}>
              <Text style={styles.messageText}>{msg.text}</Text>
              {msg.actions && (
                <View style={styles.actionsRow}>
                  {msg.actions.map((action, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.actionButton}
                      onPress={() => handleAction(action.route)}>
                      <Text style={styles.actionButtonText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
          {loading && (
            <View style={[styles.message, styles.botMsg]}>
              <Text style={styles.messageText}>Yükleniyor...</Text>
            </View>
          )}
        </ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Sorunuzu yazın..."
              placeholderTextColor="#ccc"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
  },
  messages: { flex: 1, padding: 20 },
  message: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 10,
    maxWidth: '90%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  botMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  messageText: {
    color: '#222',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    color: '#222',
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 10,
  },
}); 