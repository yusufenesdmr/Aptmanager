import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ImageStyle, ViewStyle, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView, Linking, Clipboard } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Apartment {
  id: string;
  no: string;
  floor: number;
  block: string;
  section: string;
  owner: string;
  tenant: string;
  status: string;
  phone: string;
  email: string;
}

export default function ApartmentList() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [showBlockOptions, setShowBlockOptions] = useState(false);
  const [showFloorOptions, setShowFloorOptions] = useState(false);

  useEffect(() => {
    const fetchApartments = async () => {
      setLoading(true);
      try {
        const qApartments = query(collection(db, 'apartments'));
        
        const unsubscribeApartments = onSnapshot(qApartments, (snapshot) => {
          try {
            const apartmentsData = snapshot.docs.map(doc => {
              const data = { id: doc.id, ...doc.data() } as Apartment;
              console.log('Daire verisi:', data);
              return data;
            });
            setApartments(apartmentsData);
          } catch (error) {
            console.error("Veri işlenirken hata oluştu:", error);
            Alert.alert('Hata', 'Veriler işlenirken bir sorun oluştu.');
          } finally {
            setLoading(false);
          }
        }, (error) => {
          console.error("Daireler çekilirken hata oluştu:", error);
      setLoading(false);
          Alert.alert('Hata', 'Veriler yüklenirken bir sorun oluştu.');
    });

        return () => unsubscribeApartments();
      } catch (error) {
        console.error("Veri çekilirken hata oluştu:", error);
        setLoading(false);
        Alert.alert('Hata', 'Veriler yüklenirken bir sorun oluştu.');
      }
    };

    fetchApartments();
  }, []);

  const handleAdd = () => {
    router.push('/admin/apartments/add' as any);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/apartments/edit/${id}` as any);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Daire Sil', 'Bu daireyi silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        await deleteDoc(doc(db, 'apartments', id));
      }}
    ]);
  };

  // Arama ve Filtreleme
  const filtered = apartments.filter(item => {
    const matchesSearch = item.no?.toLowerCase().includes(search.toLowerCase()) ||
                          item.block?.toLowerCase().includes(search.toLowerCase()) ||
                          item.owner?.toLowerCase().includes(search.toLowerCase());

    const matchesBlock = selectedBlock ? item.block === selectedBlock : true;
    const matchesFloor = selectedFloor ? item.floor === selectedFloor : true;

    return matchesSearch && matchesBlock && matchesFloor;
  });

  const uniqueBlocks = Array.from(new Set(apartments.map(item => item.block).filter(Boolean))).sort();
  const uniqueFloors = Array.from(new Set(apartments.map(item => item.floor).filter(Boolean))).sort((a: string, b: string) => parseInt(a) - parseInt(b));

  const handleSearch = () => {
    if (searchText.trim()) {
      setSearch(searchText.trim());
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchText('');
    setSelectedBlock(null);
    setSelectedFloor(null);
    setShowBlockOptions(false);
    setShowFloorOptions(false);
  };

  const handleSelectBlock = (block: string | null) => {
    setSelectedBlock(block);
    setShowBlockOptions(false);
  };

  const handleSelectFloor = (floor: string | null) => {
    setSelectedFloor(floor);
    setShowFloorOptions(false);
  };

  const getStatusInfo = (status: string) => {
    if (status === 'Dolu') {
      return {
        status: 'Dolu',
        color: '#34C759',
        bgColor: '#34C75920'
      };
    }
    return {
      status: 'Boş',
      color: '#FF9500',
      bgColor: '#FF950020'
    };
  };

  const handlePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
      Alert.alert('Hata', 'Telefon araması başlatılamadı.');
    });
  };

  const handleCopyEmail = (email: string) => {
    Clipboard.setString(email);
    Alert.alert('Başarılı', 'E-posta adresi kopyalandı.');
  };

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
          <Text style={styles.headerTitle}>Daire Yönetimi</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
              placeholder="Daire No, Kat, Blok, Bölüm veya Kiracı ara..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleClearFilters} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
            )}
          </View>
          </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
        {loading ? (
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={64} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.emptyText}>
                {search ? 'Arama sonucu bulunamadı.' : 'Daire bulunmuyor.'}
              </Text>
              <Text style={styles.emptySubText}>
                {search ? 'Farklı bir arama terimi deneyin.' : 'Yeni daire eklemek için sağ üstteki + butonunu kullanabilirsiniz.'}
              </Text>
            </View>
        ) : (
            <View style={styles.apartmentsContainer}>
              {filtered.map((apartment) => (
                <TouchableOpacity 
                  key={apartment.id} 
                  style={styles.apartmentCard}
                  onPress={() => handleEdit(apartment.id)}
                >
                  <View style={styles.apartmentHeader}>
                    <View style={styles.apartmentInfo}>
                      <View style={styles.apartmentTitleContainer}>
                        <Ionicons name="home-outline" size={20} color="#fff" style={styles.apartmentIcon} />
                        <Text style={styles.apartmentTitle}>Daire {apartment.no}</Text>
                      </View>
                      <View style={styles.apartmentDetailsContainer}>
                        <Text style={styles.apartmentDetails}>
                          {apartment.floor ? `${apartment.floor}. Kat` : ''} 
                          {apartment.block ? ` ${apartment.block} Blok` : ''} 
                          {apartment.section ? ` ${apartment.section} Bölüm` : ''}
                        </Text>
              </View>
                  </View>
                  </View>
                  <View style={styles.apartmentInfoContainer}>
                    <View style={styles.ownerContainer}>
                      <Ionicons name="person-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                      <Text style={styles.ownerText}>
                        {apartment.owner || 'Malik bilgisi yok'}
                      </Text>
                </View>
                    {apartment.phone && (
                      <TouchableOpacity 
                        style={styles.contactContainer}
                        onPress={() => handlePhoneCall(apartment.phone)}
                      >
                        <Ionicons name="call-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        <Text style={styles.contactText}>
                          {apartment.phone}
                        </Text>
              </TouchableOpacity>
            )}
                    {apartment.email && (
                      <View style={styles.contactContainer}>
                        <Ionicons name="mail-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        <Text style={styles.contactText}>
                          {apartment.email}
                        </Text>
                        <TouchableOpacity 
                          style={styles.copyButton}
                          onPress={() => handleCopyEmail(apartment.email)}
                        >
                          <Ionicons name="copy-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        </TouchableOpacity>
                      </View>
                    )}
                    {apartment.tenant && (
                      <View style={styles.tenantContainer}>
                        <Ionicons name="people-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        <Text style={styles.tenantText}>
                          {apartment.tenant}
                        </Text>
                      </View>
        )}
      </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 20,
    paddingTop: 0,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  apartmentsContainer: {
    gap: 15,
  },
  apartmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  apartmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  apartmentInfo: {
    flex: 1,
  },
  apartmentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apartmentIcon: {
    marginRight: 8,
  },
  apartmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  apartmentDetailsContainer: {
    marginTop: 8,
    gap: 4,
  },
  apartmentDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  apartmentInfoContainer: {
    marginTop: 12,
    gap: 8,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tenantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tenantText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  contactText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  copyButton: {
    padding: 4,
    marginLeft: 4,
  },
}); 