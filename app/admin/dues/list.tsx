import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Dues {
  id: string;
  month: string;
  year: string;
  amount: number;
  status: string;
  apartmentId: string;
  apartmentNo: string;
  dueDate: {
    seconds: number;
    nanoseconds: number;
  };
  email?: string;
}

export default function DuesList() {
  const [dues, setDues] = useState<Dues[]>([]);
  const [apartments, setApartments] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDuesAndApartments = async () => {
      setLoading(true);
      try {
        const qDues = query(collection(db, 'dues'));
        
        const unsubscribeDues = onSnapshot(qDues, async (snapshot) => {
          try {
            const duesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dues[];
            
            // Sadece Beklemede durumundaki ve gecikmemiş aidatları filtrele
            const activeDues = duesData.filter(due => {
              if (due.status !== 'Beklemede') return false;
              
              // Tarih kontrolü
              if (!due.dueDate) return true;
              
              const now = new Date();
              const dueDate = new Date(due.dueDate.seconds * 1000);
              return dueDate >= now; // Sadece vadesi gelmemiş aidatları göster
            });

          // Benzersiz daire ID'lerini topla
            const apartmentIds = Array.from(new Set(activeDues.map((due: Dues) => due.apartmentId).filter(Boolean)));

          if (apartmentIds.length > 0) {
            const qApartments = query(collection(db, 'apartments'), where('__name__', 'in', apartmentIds));
            const apartmentsSnapshot = await getDocs(qApartments);
            const apartmentsData: any = {};
            apartmentsSnapshot.docs.forEach(doc => {
              apartmentsData[doc.id] = doc.data();
            });
            setApartments(apartmentsData);

              // Boş bilgileri olan daireleri filtrele ve e-posta bilgisini ekle
              const validDues = activeDues.filter(due => {
                const apartment = apartmentsData[due.apartmentId];
                if (apartment && (
                  apartment.floor || 
                  apartment.block || 
                  apartment.section || 
                  due.apartmentNo
                )) {
                  // E-posta bilgisini ekle
                  due.email = apartment.email;
                  return true;
                }
                return false;
              });
              
              setDues(validDues);
          } else {
            setApartments({});
              setDues([]);
            }
          } catch (error) {
            console.error("Veri işlenirken hata oluştu:", error);
            Alert.alert('Hata', 'Veriler işlenirken bir sorun oluştu.');
          } finally {
            setLoading(false);
          }
        }, (error) => {
          console.error("Aidatlar çekilirken hata oluştu:", error);
           setLoading(false);
           Alert.alert('Hata', 'Veriler yüklenirken bir sorun oluştu.');
        });

        return () => unsubscribeDues();
      } catch (error) {
        console.error("Veri çekilirken hata oluştu:", error);
        setLoading(false);
        Alert.alert('Hata', 'Veriler yüklenirken bir sorun oluştu.');
      }
    };

    fetchDuesAndApartments();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dueDate: Dues['dueDate'] | undefined) => {
    if (!dueDate) return 'Belirtilmemiş';
    const date = new Date(dueDate.seconds * 1000);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getDueDateStatus = () => {
    return {
      status: 'Aktif',
      color: '#34C759',
      bgColor: '#34C75920'
    };
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      setSearch(searchText.trim());
    }
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchText('');
  };

  const filteredDues = dues.filter(due => {
    if (!search) return true;
    
     const apartment = apartments[due.apartmentId] || {};
    const searchLower = search.toLowerCase();
    
    return (
      due.apartmentNo?.toLowerCase().includes(searchLower) ||
      (apartment.floor && apartment.floor.toString().includes(search)) ||
      (apartment.block && apartment.block.toLowerCase().includes(searchLower)) ||
      (apartment.section && apartment.section.toLowerCase().includes(searchLower))
    );
  });

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
          <Text style={styles.headerTitle}>Aktif Aidatlar</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/admin/dues/add' as any)}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
            </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
              placeholder="Daire No, Kat, Blok veya Bölüm ara..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
              />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
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
            ) : filteredDues.length === 0 ? (
              <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.emptyText}>
                {search ? 'Arama sonucu bulunamadı.' : 'Aktif aidat bulunmuyor.'}
              </Text>
              <Text style={styles.emptySubText}>
                {search ? 'Farklı bir arama terimi deneyin.' : 'Yeni aidat eklemek için sağ üstteki + butonunu kullanabilirsiniz.'}
              </Text>
              </View>
            ) : (
            <View style={styles.duesContainer}>
              {filteredDues.map((due) => {
                const dueDateStatus = getDueDateStatus();
                const apartment = apartments[due.apartmentId] || {};
                return (
                  <TouchableOpacity 
                    key={due.id} 
                    style={styles.duesCard}
                    onPress={() => router.push({
                      pathname: '/admin/dues/apartment/[apartmentId]',
                      params: { 
                        apartmentId: due.apartmentId,
                        apartmentNo: due.apartmentNo
                      }
                    } as any)}
                  >
                    <View style={styles.duesHeader}>
                      <View style={styles.duesInfo}>
                        <View style={styles.duesTitleContainer}>
                          <Ionicons name="home-outline" size={20} color="#fff" style={styles.duesIcon} />
                          <Text style={styles.duesTitle}>Daire {due.apartmentNo}</Text>
                        </View>
                        <Text style={styles.apartmentDetails}>
                          {apartment.floor ? `${apartment.floor}. Kat` : ''} 
                          {apartment.block ? ` ${apartment.block} Blok` : ''} 
                          {apartment.section ? ` ${apartment.section} Bölüm` : ''}
                        </Text>
                        <Text style={styles.emailText}>{due.email}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: dueDateStatus.bgColor }]}>
                        <Text style={[styles.statusText, { color: dueDateStatus.color }]}>
                          {dueDateStatus.status}
                      </Text>
                      </View>
                    </View>
                    <View style={styles.duesDetails}>
                      <View style={styles.amountContainer}>
                        <Text style={styles.duesAmount}>{formatCurrency(due.amount)}</Text>
                        <View style={styles.dateContainer}>
                          <Ionicons name="calendar-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                          <Text style={styles.duesDate}>
                            {due.month}/{due.year}
                      </Text>
                        </View>
                      </View>
                      <View style={styles.dueDateContainer}>
                        <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        <Text style={styles.dueDate}>
                          Son Ödeme: {formatDate(due.dueDate)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                );
              })}
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
  duesContainer: {
    gap: 15,
  },
  duesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  duesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  duesInfo: {
    flex: 1,
  },
  duesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duesIcon: {
    marginRight: 8,
  },
  duesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  apartmentDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  duesDetails: {
    gap: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duesAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duesDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
}); 