import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { db, auth } from '../../../config/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, getDocs } from 'firebase/firestore';
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
}

interface SurveyResponse {
  [key: string]: string | string[];
}

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [hasResponded, setHasResponded] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const surveysRef = collection(db, 'surveys');
    const q = query(
      surveysRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

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

        // Kullanıcının bu anketi cevaplayıp cevaplamadığını kontrol et
        const responseRef = collection(db, 'surveyResponses');
        const responseQuery = query(
          responseRef,
          where('surveyId', '==', doc.id),
          where('userId', '==', auth.currentUser?.uid)
        );
        const responseSnapshot = await getDocs(responseQuery);
        setHasResponded(prev => ({
          ...prev,
          [doc.id]: !responseSnapshot.empty
        }));

        surveyList.push(survey);
      }
      setSurveys(surveyList);
    });

    return () => unsubscribe();
  }, []);

  const handleStartSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setResponses({});
  };

  const handleSubmitSurvey = async () => {
    if (!selectedSurvey) return;

    try {
      await addDoc(collection(db, 'surveyResponses'), {
        surveyId: selectedSurvey.id,
        userId: auth.currentUser?.uid,
        responses,
        createdAt: new Date(),
      });

      setHasResponded(prev => ({
        ...prev,
        [selectedSurvey.id]: true
      }));

      Alert.alert('Başarılı', 'Anket cevaplarınız kaydedildi.');
      setSelectedSurvey(null);
    } catch (error) {
      console.error('Anket cevaplanırken hata:', error);
      Alert.alert('Hata', 'Anket cevaplanırken bir hata oluştu.');
    }
  };

  const updateResponse = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  if (selectedSurvey) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Button
            title="Geri"
            onPress={() => setSelectedSurvey(null)}
            variant="secondary"
          />
          <Text style={styles.title}>{selectedSurvey.title}</Text>
        </View>

        <View style={[styles.surveyCard, styles.card]}>
          <Text style={styles.description}>{selectedSurvey.description}</Text>

          {selectedSurvey.questions.map((question: {
            id: string;
            text: string;
            type: 'single' | 'multiple' | 'text';
            options?: string[];
          }, index: number) => (
            <View key={question.id} style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {index + 1}. {question.text}
              </Text>

              {question.type === 'text' ? (
                <TextInput
                  value={responses[question.id] as string || ''}
                  onChangeText={(text: string) => updateResponse(question.id, text)}
                  placeholder="Cevabınızı yazın"
                  multiline
                  style={styles.textInput}
                  placeholderTextColor="#999"
                />
              ) : question.type === 'single' ? (
                <View style={styles.optionsContainer}>
                  {question.options?.map((option: string, optionIndex: number) => (
                    <Button
                      key={optionIndex}
                      title={option}
                      variant={responses[question.id] === option ? 'primary' : 'secondary'}
                      onPress={() => updateResponse(question.id, option)}
                      style={styles.optionButton}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  {question.options?.map((option: string, optionIndex: number) => {
                    const selectedOptions = (responses[question.id] as string[]) || [];
                    return (
                      <Button
                        key={optionIndex}
                        title={option}
                        variant={selectedOptions.includes(option) ? 'primary' : 'secondary'}
                        onPress={() => {
                          const newOptions = selectedOptions.includes(option)
                            ? selectedOptions.filter(o => o !== option)
                            : [...selectedOptions, option];
                          updateResponse(question.id, newOptions);
                        }}
                        style={styles.optionButton}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          ))}

          <Button
            title="Anketi Gönder"
            onPress={handleSubmitSurvey}
            variant="primary"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Anketler</Text>

      <View style={styles.surveyList}>
        {surveys.map((survey) => (
          <View key={survey.id} style={[styles.surveyCard, styles.card]}>
            <View style={styles.surveyHeader}>
              <View>
                <Text style={styles.surveyTitle}>{survey.title}</Text>
                <Text style={styles.surveyDate}>
                  Bitiş: {survey.endDate.toLocaleDateString('tr-TR')}
                </Text>
              </View>
              {hasResponded[survey.id] ? (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Cevaplandı</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.surveyDescription}>{survey.description}</Text>
            <View style={styles.surveyStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{survey.questions.length}</Text>
                <Text style={styles.statLabel}>Soru</Text>
              </View>
              {!hasResponded[survey.id] && (
                <Button
                  title="Anketi Cevapla"
                  onPress={() => handleStartSurvey(survey)}
                  variant="primary"
                  style={styles.answerButton}
                />
              )}
            </View>
          </View>
        ))}
      </View>

      {selectedSurvey && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{(selectedSurvey as Survey).title}</Text>
              <Button
                title="Kapat"
                onPress={() => setSelectedSurvey(null)}
                variant="secondary"
                size="small"
              />
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>{(selectedSurvey as Survey).description}</Text>

              {(selectedSurvey as Survey).questions.map((question: {
                id: string;
                text: string;
                type: 'single' | 'multiple' | 'text';
                options?: string[];
              }, index: number) => (
                <View key={question.id} style={styles.questionContainer}>
                  <Text style={styles.questionText}>
                    {index + 1}. {question.text}
                  </Text>

                  {question.type === 'text' ? (
                    <TextInput
                      value={responses[question.id] as string || ''}
                      onChangeText={(text: string) => updateResponse(question.id, text)}
                      placeholder="Cevabınızı yazın"
                      multiline
                      style={styles.textInput}
                      placeholderTextColor="#999"
                    />
                  ) : question.type === 'single' ? (
                    <View style={styles.optionsContainer}>
                      {question.options?.map((option: string, optionIndex: number) => (
                        <Button
                          key={optionIndex}
                          title={option}
                          variant={responses[question.id] === option ? 'primary' : 'secondary'}
                          onPress={() => updateResponse(question.id, option)}
                          style={styles.optionButton}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.optionsContainer}>
                      {question.options?.map((option: string, optionIndex: number) => {
                        const selectedOptions = (responses[question.id] as string[]) || [];
                        return (
                          <Button
                            key={optionIndex}
                            title={option}
                            variant={selectedOptions.includes(option) ? 'primary' : 'secondary'}
                            onPress={() => {
                              const newOptions = selectedOptions.includes(option)
                                ? selectedOptions.filter(o => o !== option)
                                : [...selectedOptions, option];
                              updateResponse(question.id, newOptions);
                            }}
                            style={styles.optionButton}
                          />
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}

              <Button
                title="Anketi Gönder"
                onPress={handleSubmitSurvey}
                variant="primary"
                style={styles.submitButton}
              />
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
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
  statusBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    alignItems: 'center',
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
  answerButton: {
    minWidth: 120,
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
  modalDescription: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    lineHeight: 22,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  description: {
    marginBottom: 16,
  },
}); 