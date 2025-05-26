import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Firebase config path adjusted for admin

interface Message {
  from: 'user' | 'bot';
  text: string;
  actions?: { label: string; route: string }[];
}

const BOT_INTRO = {
  from: 'bot' as const,
  text: 'Merhaba! Ben AptManager Yönetici Yardımcısı. Yönetici paneli ile ilgili sorularınızı bana yazabilirsiniz. Size nasıl yardımcı olabilirim?',
  actions: [
    { label: 'Daire Yönetimi', route: '/admin/apartment/list' },
    { label: 'Aidat Yönetimi', route: '/admin/dues/list' },
    { label: 'Duyuru Yönetimi', route: '/admin/announcements/list' },
    { label: 'Şikayet Yönetimi', route: '/admin/complaints/list' },
    { label: 'Ortak Alanlar Yönetimi', route: '/admin/common-areas/list' },
    { label: 'Kullanıcı Yönetimi', route: '/admin/user/list' },
    { label: 'Ayarlar', route: '/admin/settings' },
  ],
};

function getBotResponse(input: string, dues?: any[]): Message {
  const lower = input.toLowerCase();

  // Admin specific responses
  if (lower.includes('daire') && lower.includes('yönetim')) {
    return {
      from: 'bot' as const,
      text: 'Daireleri görüntülemek, düzenlemek veya eklemek için Daire Yönetimi sayfasını kullanabilirsiniz.',
      actions: [
        { label: 'Daire Yönetimi', route: '/admin/apartment/list' },
      ],
    };
  }
  if (lower.includes('aidat') && lower.includes('yönetim')) {
    return {
      from: 'bot' as const,
      text: 'Aidatları yönetmek, yeni aidat eklemek veya aidatları filtrelemek için Aidat Yönetimi sayfasını kullanabilirsiniz.',
      actions: [
        { label: 'Aidat Yönetimi', route: '/admin/dues/list' },
      ],
    };
  }
  if (lower.includes('duyuru') && lower.includes('yönetim')) {
    return {
      from: 'bot' as const,
      text: 'Duyuruları eklemek, düzenlemek veya silmek için Duyuru Yönetimi sayfasını kullanabilirsiniz.',
      actions: [
        { label: 'Duyuru Yönetimi', route: '/admin/announcements/list' },
      ],
    };
  }
    if (lower.includes('şikayet') && lower.includes('yönetim')) {
    return {
      from: 'bot' as const,
      text: 'Gelen şikayetleri görüntülemek ve yönetmek için Şikayet Yönetimi sayfasını kullanabilirsiniz.',
      actions: [
        { label: 'Şikayet Yönetimi', route: '/admin/complaints/list' },
      ],
    };
  }
    if ((lower.includes('ortak alan') || lower.includes('havuz') || lower.includes('spor') || lower.includes('hamam')) && lower.includes('yönetim')) {
    return {
      from: 'bot' as const,
      text: 'Ortak alanları eklemek, düzenlemek ve rezervasyonlarını yönetmek için Ortak Alanlar Yönetimi sayfasını kullanabilirsiniz.',
      actions: [
        { label: 'Ortak Alanlar Yönetimi', route: '/admin/common-areas/list' },
      ],
    };
  }
    if (lower.includes('kullanıcı') && lower.includes('yönetim')) {
    return {
      from: 'bot' as const,
      text: 'Kullanıcıları görüntülemek ve yönetmek için Kullanıcı Yönetimi sayfasını kullanabilirsiniz.',
      actions: [
        { label: 'Kullanıcı Yönetimi', route: '/admin/user/list' },
      ],
    };
  }
      if (lower.includes('ayarlar')) {
    return {
      from: 'bot' as const,
      text: 'Hesap ayarlarınızı ve diğer uygulama ayarlarını yönetmek için Ayarlar sayfasını kullanabilirsiniz.',
      actions: [
        { label: 'Ayarlar', route: '/admin/settings' },
      ],
    };
  }
    if (lower.includes('hava durumu')) {
    return {
      from: 'bot' as const,
      text: 'Şehirlerin hava durumu tahminlerini görmek için Hava Durumu sayfasını kullanabilirsiniz.',
      actions: [
        { label: 'Hava Durumu', route: '/admin/weather' },
      ],
    };
  }

  // Aidat listeleme (Admin can also list dues)
  if (lower.includes('aidat') && (lower.includes('liste') || lower.includes('göster') || lower.includes('bul'))) {
     return {
        from: 'bot' as const,
        text: 'Aidat listesini görüntülemek için Aidat Yönetimi sayfasını kullanabilirsiniz.',
        actions: [
          { label: 'Aidat Yönetimi', route: '/admin/dues/list' },
        ],
      };
  }

  // Default response
  return {
    from: 'bot' as const,
    text: 'Üzgünüm, bu konuda yardımcı olamıyorum. Lütfen yönetici paneli ile ilgili bir konu hakkında soru sorun veya aşağıdaki seçeneklerden birini seçin.',
    actions: BOT_INTRO.actions,
  };
}

export default function AdminHelpCenter() {
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
      // Send to Gemini API for general queries
      const res = await fetch('http://localhost:3000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      // After getting AI response, check if it's a general query or admin specific
      const botMsg = getBotResponse(input);

      // If getBotResponse returns a specific admin action, use that instead of AI response
       if (botMsg.actions || botMsg.text !== BOT_INTRO.text) {
         setMessages((prev) => [...prev, botMsg]);
       } else {
         setMessages((prev) => [...prev, { from: 'bot', text: data.text }]);
       }

    } catch (e) {
      console.error('AI veya Bot cevabı alınırken hata:', e);
      setMessages((prev) => [...prev, { from: 'bot', text: 'Yardım alınırken bir sorun oluştu.' }]);
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
          <Text style={styles.headerTitle}>Yönetici Yardım Merkezi</Text>
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