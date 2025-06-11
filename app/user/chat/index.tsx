import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  Dimensions,
  Animated,
  Modal,
  ActionSheetIOS,
  ImageBackground,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../../../config/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  isRead: boolean;
  senderName: string;
  senderEmail: string;
  senderApartment?: string;
  senderFloor?: string;
  senderBlock?: string;
  isGroupMessage?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  apartmentNo?: string;
  floor?: string;
  block?: string;
  phone?: string;
}

const { width } = Dimensions.get('window');

const logoImage = require('../../../assets/images/logo1.jpg'); // Logo resmi

const UserChat: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGroupChat, setIsGroupChat] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-width)).current;
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser || isGroupChat) {
      fetchMessages();
    }
  }, [selectedUser, isGroupChat]);

  const toggleMenu = () => {
    const toValue = isMenuOpen ? -width : 0;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '!=', auth.currentUser?.email));
      const querySnapshot = await getDocs(q);
      
      const usersList: User[] = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const email = data.email || '';
        const userType = data.userType || '';
        
        const apartmentsRef = collection(db, 'apartments');
        const apartmentQuery = query(apartmentsRef, where('email', '==', email));
        const apartmentSnapshot = await getDocs(apartmentQuery);
        const apartmentData = apartmentSnapshot.docs[0]?.data() || {};
        
        const block = apartmentData.block || '';
        const apartmentNo = apartmentData.apartmentNo || '';
        
        let name = '';
        if (userType === 'admin') {
          name = 'Yönetici';
        } else {
          const baseName = data.name || email.split('@')[0] || 'Kullanıcı';
          if (block && apartmentNo) {
            name = `${baseName} (${block} Blok ${apartmentNo})`;
          } else {
            name = baseName;
          }
        }
        
        usersList.push({
          id: doc.id,
          name: name,
          email: email,
          userType: userType,
          apartmentNo: apartmentNo,
          floor: apartmentData.floor || '',
          block: block,
          phone: data.phone || '',
        });
      }
      
      setUsers(usersList);
    } catch (error) {
      console.error('Kullanıcılar alınırken hata:', error);
      Alert.alert('Hata', 'Kullanıcılar alınırken bir sorun oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = () => {
    if (!selectedUser && !isGroupChat) return;

    const messagesRef = collection(db, 'messages');
    let q;

    if (isGroupChat) {
      q = query(
        messagesRef,
        where('isGroupMessage', '==', true),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        messagesRef,
        where('isGroupMessage', '==', false),
        where('senderId', 'in', [auth.currentUser?.uid, selectedUser]),
        where('receiverId', 'in', [auth.currentUser?.uid, selectedUser]),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          receiverId: data.receiverId,
          createdAt: data.createdAt.toDate(),
          isRead: data.isRead,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          senderApartment: data.senderApartment,
          senderFloor: data.senderFloor,
          senderBlock: data.senderBlock,
          isGroupMessage: data.isGroupMessage,
        });
      });

      messagesList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      setMessages(messagesList);

      messagesList.forEach(async (message) => {
        if (!message.isRead && message.receiverId === auth.currentUser?.uid) {
          try {
            await updateDoc(doc(db, 'messages', message.id), {
              isRead: true
            });
          } catch (error) {
            console.error('Mesaj okundu işaretlenirken hata:', error);
          }
        }
      });
    });

    return () => {
      unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!message.trim() || (!selectedUser && !isGroupChat)) return;

    try {
      const messageData: {
        text: string;
        senderId: string | undefined;
        receiverId: string | null;
        createdAt: Timestamp;
        isRead: boolean;
        senderName: string;
        senderEmail: string | null | undefined;
        isGroupMessage: boolean;
        senderApartment?: string;
        senderFloor?: string;
        senderBlock?: string;
      } = {
        text: message.trim(),
        senderId: auth.currentUser?.uid,
        receiverId: isGroupChat ? 'group' : selectedUser,
        createdAt: Timestamp.now(),
        isRead: false,
        senderName: auth.currentUser?.displayName || 'Kullanıcı',
        senderEmail: auth.currentUser?.email,
        isGroupMessage: isGroupChat,
      };

      if (!isGroupChat && selectedUser) {
        const selectedUserData = users.find(user => user.id === selectedUser);
        if (selectedUserData) {
          messageData.senderApartment = selectedUserData.apartmentNo || 'Belirtilmemiş';
          messageData.senderFloor = selectedUserData.floor || 'Belirtilmemiş';
          messageData.senderBlock = selectedUserData.block || 'Belirtilmemiş';
        }
      }

      await addDoc(collection(db, 'messages'), messageData);
      setMessage('');
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      Alert.alert('Hata', 'Mesaj gönderilirken bir sorun oluştu!');
    }
  };

  const showUserOptions = (user: User) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['İptal', 'Sohbete Git', 'Bilgileri Göster'],
          cancelButtonIndex: 0,
          userInterfaceStyle: 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setSelectedUser(user.id);
            setIsGroupChat(false);
            toggleMenu();
          } else if (buttonIndex === 2) {
            setSelectedUserDetails(user);
            setIsDetailsModalVisible(true);
          }
        }
      );
    } else {
      Alert.alert(
        'Seçenekler',
        'Ne yapmak istersiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Sohbete Git',
            onPress: () => {
              setSelectedUser(user.id);
              setIsGroupChat(false);
              toggleMenu();
            },
          },
          {
            text: 'Bilgileri Göster',
            onPress: () => {
              setSelectedUserDetails(user);
              setIsDetailsModalVisible(true);
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.senderId === auth.currentUser?.uid;
    const sender = users.find(user => user.id === item.senderId);
    
    let senderName = '';
    if (sender?.userType === 'admin') {
      senderName = 'Yönetici';
    } else {
      const baseName = sender?.name || item.senderName || item.senderEmail?.split('@')[0] || 'Kullanıcı';
      const block = sender?.block || '';
      const apartmentNo = sender?.apartmentNo || '';
      
      if (block && apartmentNo) {
        senderName = `${baseName} (${block} Blok ${apartmentNo})`;
      } else {
        senderName = baseName;
      }
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.adminMessage,
        ]}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{senderName}</Text>
          <Text style={styles.timestamp}>
            {item.createdAt.toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.adminMessageText,
          ]}>
          {item.text}
        </Text>
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userListItem}
      onPress={() => showUserOptions(item)}>
      <View style={styles.userListItemContent}>
        <Ionicons
          name={item.userType === 'admin' ? 'shield' : 'person'}
          size={24}
          color="#1E88E5"
        />
        <View style={styles.userListItemInfo}>
          <Text style={styles.userListItemName}>{item.name}</Text>
          <Text style={styles.userListItemType}>
            {item.userType === 'admin' ? 'Yönetici' : 'Kullanıcı'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUserDetailsModal = () => (
    <Modal
      visible={isDetailsModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsDetailsModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kullanıcı Bilgileri</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsDetailsModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {selectedUserDetails && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={20} color="#1E88E5" />
                <Text style={styles.detailText}>{selectedUserDetails.name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="mail" size={20} color="#1E88E5" />
                <Text style={styles.detailText}>{selectedUserDetails.email}</Text>
              </View>
              
              {selectedUserDetails.phone && (
                <View style={styles.detailRow}>
                  <Ionicons name="call" size={20} color="#1E88E5" />
                  <Text style={styles.detailText}>{selectedUserDetails.phone}</Text>
                </View>
              )}
              
              {selectedUserDetails.block && (
                <View style={styles.detailRow}>
                  <Ionicons name="business" size={20} color="#1E88E5" />
                  <Text style={styles.detailText}>
                    {selectedUserDetails.block} Blok
                  </Text>
                </View>
              )}
              
              {selectedUserDetails.apartmentNo && (
                <View style={styles.detailRow}>
                  <Ionicons name="home" size={20} color="#1E88E5" />
                  <Text style={styles.detailText}>
                    Daire No: {selectedUserDetails.apartmentNo}
                  </Text>
                </View>
              )}
              
              {selectedUserDetails.floor && (
                <View style={styles.detailRow}>
                  <Ionicons name="layers" size={20} color="#1E88E5" />
                  <Text style={styles.detailText}>
                    {selectedUserDetails.floor}. Kat
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Image source={logoImage} style={[styles.backgroundImage, { opacity: 0.5 }]} resizeMode="cover" />

      <LinearGradient
        colors={['#1E88E5', '#1565C0']}
        style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleMenu}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isGroupChat ? 'Grup' : users.find(user => user.id === selectedUser)?.name || 'Kullanıcı'}
        </Text>
        {!isGroupChat && (
          <TouchableOpacity
            style={styles.backToGroupButton}
            onPress={() => {
              setIsGroupChat(true);
              setSelectedUser(null);
            }}>
            <Ionicons name="people" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <Animated.View
        style={[
          styles.sideMenu,
          {
            transform: [
              {
                translateX: menuAnimation,
              },
            ],
          }]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Kullanıcılar</Text>
        </View>
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          style={styles.userList}
        />
      </Animated.View>

      <View style={styles.content}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesListContent}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim()}>
            <Ionicons
              name="send"
              size={24}
              color={message.trim() ? '#fff' : '#ccc'}
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>

      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}
      {renderUserDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
    marginRight: 15,
  },
  backToGroupButton: {
    marginLeft: 'auto',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'left',
    marginLeft: 130,
  },
  content: {
    flex: 1,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuHeader: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1E88E5',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userList: {
    flex: 1,
  },
  userListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userListItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userListItemInfo: {
    marginLeft: 15,
  },
  userListItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userListItemType: {
    fontSize: 14,
    color: '#666',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  adminMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E88E5',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E3F2FD',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
  },
  adminMessageText: {
    color: '#fff',
  },
  userMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '80%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  detailsContainer: {
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  logoInListContainer: {
    // alignItems: 'center',
    // paddingVertical: 20,
  },
  circularLogo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
});

export default UserChat; 