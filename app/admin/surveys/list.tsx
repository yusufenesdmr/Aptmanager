import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { db } from '../../../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: {
    id: string;
    text: string;
    type: 'single' | 'multiple' | 'text';
    options?: string[];
  }[];
  createdAt: Date;
  endDate: Date;
  isActive: boolean;
  responseCount: number;
}

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSurvey, setNewSurvey] = useState<Partial<Survey>>({
    title: '',
    description: '',
    questions: [],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
    isActive: true
  });
  const [selectedSurveyForResponses, setSelectedSurveyForResponses] = useState<Survey | null>(null);
  const [surveyResponsesStats, setSurveyResponsesStats] = useState<any>({}); // Store aggregated stats

  useEffect(() => {
    const surveysRef = collection(db, 'surveys');
    const q = query(surveysRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const surveyList: Survey[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const survey = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          endDate: data.endDate.toDate(),
        } as Survey;

        // Get response count for this survey
        const responsesQuery = query(
          collection(db, 'surveyResponses'),
          where('surveyId', '==', doc.id)
        );
        const responseSnapshot = await getDocs(responsesQuery);
        const responseCount = responseSnapshot.size;

        surveyList.push({ ...survey, responseCount });
      }
      setSurveys(surveyList);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateSurvey = async () => {
    if (!newSurvey.title || !newSurvey.description || newSurvey.questions?.length === 0) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun ve en az bir soru ekleyin.');
      return;
    }

    try {
      await addDoc(collection(db, 'surveys'), {
        ...newSurvey,
        createdAt: new Date(),
      });
      setIsCreating(false);
      setNewSurvey({
        title: '',
        description: '',
        questions: [],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    } catch (error) {
      console.error('Anket oluşturulurken hata:', error);
      Alert.alert('Hata', 'Anket oluşturulurken bir hata oluştu.');
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    try {
      await deleteDoc(doc(db, 'surveys', surveyId));
    } catch (error) {
      console.error('Anket silinirken hata:', error);
      Alert.alert('Hata', 'Anket silinirken bir hata oluştu.');
    }
  };

  const addQuestion = () => {
    setNewSurvey(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          id: Date.now().toString(),
          text: '',
          type: 'single',
          options: [''],
        },
      ],
    }));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setNewSurvey(prev => {
      const questions = [...(prev.questions || [])];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const addOption = (questionIndex: number) => {
    setNewSurvey(prev => {
      const questions = [...(prev.questions || [])];
      questions[questionIndex].options = [...(questions[questionIndex].options || []), ''];
      return { ...prev, questions };
    });
  };

  const handleViewResponses = async (survey: Survey) => {
    setSelectedSurveyForResponses(survey);
    setSurveyResponsesStats({}); // Clear previous stats
    try {
      const responsesQuery = query(
        collection(db, 'surveyResponses'),
        where('surveyId', '==', survey.id)
      );
      const responseSnapshot = await getDocs(responsesQuery);
      const responsesData = responseSnapshot.docs.map(doc => doc.data());

      // Calculate stats
      const stats: any = {};
      const totalResponses = responsesData.length;

      if (totalResponses === 0) {
        setSurveyResponsesStats(stats); // Set empty stats if no responses
        return;
      }

      survey.questions.forEach(question => {
        if (question.type === 'single' || question.type === 'multiple') {
          // For choice questions, count options
          const optionCounts: { [key: string]: number } = {};
          responsesData.forEach(response => {
            const answer = response.responses[question.id];
            if (answer) {
              if (Array.isArray(answer)) {
                answer.forEach(opt => {
                  optionCounts[opt] = (optionCounts[opt] || 0) + 1;
                });
              } else {
                optionCounts[answer] = (optionCounts[answer] || 0) + 1;
              }
            }
          });

          // Calculate percentages
          const optionStats = Object.entries(optionCounts).map(([option, count]) => ({
            option,
            count,
            percentage: totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(2) : '0.00',
          }));
          stats[question.id] = { type: question.type, stats: optionStats };

        } else if (question.type === 'text') {
          // For text questions, just count the number of responses
          const textResponsesCount = responsesData.filter(response => response.responses[question.id]).length;
          stats[question.id] = { type: question.type, count: textResponsesCount };
        }
      });

      setSurveyResponsesStats(stats);

    } catch (error) {
      console.error('Cevap istatistikleri çekilirken hata:', error);
      Alert.alert('Hata', 'Cevap istatistikleri çekilirken bir hata oluştu.');
      setSurveyResponsesStats({}); // Clear previous stats on error
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Anket Yönetimi</Text>
        <Button
          title={isCreating ? "İptal" : "Yeni Anket"}
          onPress={() => setIsCreating(!isCreating)}
          variant={isCreating ? "secondary" : "primary"}
          style={styles.createButton}
        />
      </View>

      {isCreating && (
        <View style={[styles.createCard, styles.card]}>
          <Text style={styles.sectionTitle}>Yeni Anket Oluştur</Text>
          <TextInput
            value={newSurvey.title}
            onChangeText={(text: string) => setNewSurvey(prev => ({ ...prev, title: text }))}
            placeholder="Anket başlığını girin"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            value={newSurvey.description}
            onChangeText={(text: string) => setNewSurvey(prev => ({ ...prev, description: text }))}
            placeholder="Anket açıklamasını girin"
            multiline
            style={[styles.input, styles.textArea]}
            placeholderTextColor="#999"
          />

          <Text style={styles.sectionTitle}>Sorular</Text>
          {newSurvey.questions?.map((question, index) => (
            <View key={question.id} style={[styles.questionCard, styles.card]}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Soru {index + 1}</Text>
                <Button
                  title="Sil"
                  onPress={() => {
                    const questions = [...(newSurvey.questions || [])];
                    questions.splice(index, 1);
                    setNewSurvey(prev => ({ ...prev, questions }));
                  }}
                  variant="secondary"
                  size="small"
                />
              </View>
              <TextInput
                value={question.text}
                onChangeText={(text: string) => updateQuestion(index, 'text', text)}
                placeholder="Soruyu girin"
                style={styles.input}
                placeholderTextColor="#999"
              />
              <View style={styles.questionTypeContainer}>
                <Button
                  title="Tek Seçim"
                  variant={question.type === 'single' ? 'primary' : 'secondary'}
                  onPress={() => updateQuestion(index, 'type', 'single')}
                  size="small"
                  style={styles.typeButton}
                />
                <Button
                  title="Çoklu Seçim"
                  variant={question.type === 'multiple' ? 'primary' : 'secondary'}
                  onPress={() => updateQuestion(index, 'type', 'multiple')}
                  size="small"
                  style={styles.typeButton}
                />
                <Button
                  title="Metin"
                  variant={question.type === 'text' ? 'primary' : 'secondary'}
                  onPress={() => updateQuestion(index, 'type', 'text')}
                  size="small"
                  style={styles.typeButton}
                />
              </View>

              {(question.type === 'single' || question.type === 'multiple') && (
                <View style={styles.optionsContainer}>
                  {question.options?.map((option, optionIndex) => (
                    <View key={optionIndex} style={styles.optionRow}>
                      <TextInput
                        value={option}
                        onChangeText={(text: string) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[optionIndex] = text;
                          updateQuestion(index, 'options', newOptions);
                        }}
                        placeholder={`Seçenek ${optionIndex + 1}`}
                        style={styles.optionInput}
                        placeholderTextColor="#999"
                      />
                      <Button
                        title="Sil"
                        onPress={() => {
                          const newOptions = [...(question.options || [])];
                          newOptions.splice(optionIndex, 1);
                          updateQuestion(index, 'options', newOptions);
                        }}
                        variant="secondary"
                        size="small"
                      />
                    </View>
                  ))}
                  <Button
                    title="Seçenek Ekle"
                    onPress={() => addOption(index)}
                    variant="secondary"
                    size="small"
                    style={styles.addOptionButton}
                  />
                </View>
              )}
            </View>
          ))}

          <Button
            title="Soru Ekle"
            onPress={addQuestion}
            variant="secondary"
            style={styles.addQuestionButton}
          />

          <Button
            title="Anketi Oluştur"
            onPress={handleCreateSurvey}
            variant="primary"
            style={styles.submitButton}
          />
        </View>
      )}

      <View style={styles.surveyList}>
        {surveys.map((survey) => (
          <View key={survey.id} style={[styles.surveyCard, styles.card]}>
            <View style={styles.surveyHeader}>
              <View>
                <Text style={styles.surveyTitle}>{survey.title}</Text>
                <Text style={styles.surveyDate}>
                  {survey.createdAt.toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <View style={styles.surveyActions}>
                <Button
                  title="Cevapları Gör"
                  onPress={() => handleViewResponses(survey)}
                  variant="secondary"
                  size="small"
                  style={{ marginRight: 8 }}
                />
                <Button
                  title="Sil"
                  onPress={() => handleDeleteSurvey(survey.id)}
                  variant="secondary"
                  size="small"
                />
              </View>
            </View>
            <Text style={styles.surveyDescription}>{survey.description}</Text>
            <View style={styles.surveyStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{survey.questions.length}</Text>
                <Text style={styles.statLabel}>Soru</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {survey.endDate.toLocaleDateString('tr-TR')}
                </Text>
                <Text style={styles.statLabel}>Bitiş</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[
                  styles.statValue,
                  { color: survey.isActive ? theme.colors.success : theme.colors.error }
                ]}>
                  {survey.isActive ? 'Aktif' : 'Pasif'}
                </Text>
                <Text style={styles.statLabel}>Durum</Text>
              </View>
              {('responseCount' in survey) && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{(survey as any).responseCount}</Text>
                  <Text style={styles.statLabel}>Cevap</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Responses Modal */}
      {selectedSurveyForResponses && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSurveyForResponses.title} Cevap İstatistikleri</Text>
              <Button
                title="Kapat"
                onPress={() => setSelectedSurveyForResponses(null)}
                variant="secondary"
                size="small"
              />
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedSurveyForResponses && Object.keys(surveyResponsesStats).length === 0 ? (
                <Text>Bu ankete henüz cevap verilmemiş veya istatistikler hesaplanıyor...</Text>
              ) : (
                selectedSurveyForResponses?.questions.map((question, index) => {
                  const stats = surveyResponsesStats[question.id];
                  if (!stats) return null;

                  return (
                    <View key={question.id} style={styles.questionStatsContainer}>
                      <Text style={styles.questionText}>{index + 1}. {question.text}</Text>
                      {stats.type === 'text' ? (
                        <Text style={styles.statItemText}>Toplam Cevap Sayısı: {stats.count}</Text>
                      ) : (
                        <View style={styles.optionsStatsContainer}>
                          {stats.stats.map((optionStat: any, optionIndex: number) => (
                            <Text key={optionIndex} style={styles.optionStatText}>
                              {optionStat.option}: {optionStat.count} ({optionStat.percentage}%)
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    minWidth: 120,
  },
  createCard: {
    marginBottom: 24,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  questionCard: {
    marginBottom: 20,
    padding: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  questionTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
  },
  optionsContainer: {
    marginTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  addOptionButton: {
    marginTop: 8,
  },
  addQuestionButton: {
    marginTop: 16,
  },
  submitButton: {
    marginTop: 24,
  },
  surveyList: {
    gap: 16,
  },
  surveyCard: {
    padding: 20,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  surveyDate: {
    fontSize: 14,
    color: '#666',
  },
  surveyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  surveyDescription: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    lineHeight: 22,
  },
  surveyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  questionStatsContainer: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  optionsStatsContainer: {
    marginTop: 8,
  },
  optionStatText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
}); 