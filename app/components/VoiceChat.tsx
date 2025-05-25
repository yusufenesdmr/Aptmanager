import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

interface VoiceChatProps {
  onMessageReceived: (message: string) => void;
}

export default function VoiceChat({ onMessageReceived }: VoiceChatProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    // Ses izinlerini iste
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Ses kaydı için izin gerekli!');
      }
    })();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordedAudio(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Kayıt başlatılamadı:', error);
    }
  };

  const stopRecording = async () => {
    if (!recordedAudio) return;

    try {
      await recordedAudio.stopAndUnloadAsync();
      const uri = recordedAudio.getURI();
      setIsRecording(false);

      if (uri) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSound(sound);
        await sound.playAsync();
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && !status.isPlaying) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Kayıt durdurulamadı:', error);
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      // Burada gerçek bir konuşma tanıma servisi entegre edilmeli
      // Şimdilik test amaçlı bir mesaj gönderiyoruz
      setTimeout(() => {
        onMessageReceived('Bu bir test sesli mesajıdır.');
        setIsListening(false);
      }, 2000);
    } catch (error) {
      console.error('Dinleme başlatılamadı:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={isRecording ? stopRecording : startRecording}>
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic'}
            size={32}
            color={isRecording ? '#ff4444' : '#007AFF'}
          />
          <Text style={styles.buttonText}>
            {isRecording ? 'Kaydı Durdur' : 'Ses Kaydet'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={isListening ? stopListening : startListening}>
          <Ionicons
            name={isListening ? 'stop-circle' : 'ear'}
            size={32}
            color={isListening ? '#ff4444' : '#007AFF'}
          />
          <Text style={styles.buttonText}>
            {isListening ? 'Dinlemeyi Durdur' : 'Sesli Mesaj Dinle'}
          </Text>
        </TouchableOpacity>
      </View>

      {(isRecording || isListening || isPlaying) && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.statusText}>
            {isRecording
              ? 'Ses kaydediliyor...'
              : isListening
              ? 'Dinleniyor...'
              : 'Oynatılıyor...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  button: {
    alignItems: 'center',
    padding: 10,
    minWidth: 120,
  },
  buttonText: {
    marginTop: 5,
    color: '#007AFF',
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  statusText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
}); 