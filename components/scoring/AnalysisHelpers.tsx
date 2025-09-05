// components/scoring/AnalysisHelpers.tsx - Helper categories for detailed calculations
import React, { memo, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#818CF8',
    marginBottom: 12,
    paddingLeft: 4,
  },
  helperCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  helperTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#818CF8',
    marginBottom: 10,
  },
  helperDescription: {
    fontSize: 11,
    color: 'rgba(243, 231, 211, 0.6)',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    minWidth: '45%',
  },
  inputLabel: {
    fontSize: 11,
    color: 'rgba(243, 231, 211, 0.7)',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(28, 26, 26, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#C4A24C',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  customQuestionsContainer: {
    marginTop: 12,
  },
  addQuestionButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginTop: 8,
  },
  addQuestionText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
  },
  customQuestion: {
    marginBottom: 8,
  },
  noteCard: {
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  noteText: {
    fontSize: 11,
    color: '#FB923C',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

interface ResourceData {
  brownCards: number;
  grayCards: number;
  discardedAgeI?: number;
  discardedAgeII?: number;
  discardedAgeIII?: number;
  customData?: Record<string, any>;
}

interface AnalysisHelpersProps {
  playerId: string;
  wonderData?: any;
  onDataUpdate: (data: ResourceData) => void;
}

export const AnalysisHelpers = memo(function AnalysisHelpers({
  playerId,
  wonderData,
  onDataUpdate,
}: AnalysisHelpersProps) {
  const [resourceData, setResourceData] = useState<ResourceData>({
    brownCards: 0,
    grayCards: 0,
    customData: {},
  });

  // Hydrate from store when switching players (per-player inputs)
  useEffect(() => {
    (async () => {
      try {
        const { useScoringStore } = await import('../../store/scoringStore');
        const saved = useScoringStore.getState().analysisByPlayer?.[playerId];
        if (saved) {
          setResourceData((prev) => ({
            ...prev,
            brownCards: typeof saved.brownCards === 'number' ? saved.brownCards : prev.brownCards,
            grayCards: typeof saved.grayCards === 'number' ? saved.grayCards : prev.grayCards,
            customData: saved.customData ?? prev.customData,
          }));
        }
      } catch {}
    })();
  }, [playerId]);
  
  const [customQuestions, setCustomQuestions] = useState<{ id: string; question: string; value: string }[]>([]);
  
  const updateField = (field: keyof ResourceData, value: number) => {
    const newData = { ...resourceData, [field]: value };
    setResourceData(newData);
    onDataUpdate(newData);
  };
  
  const addCustomQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      question: '',
      value: '',
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };
  
  const updateCustomQuestion = (id: string, field: 'question' | 'value', value: string) => {
    const updated = customQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    );
    setCustomQuestions(updated);
    
    const customData = updated.reduce((acc, q) => {
      if (q.question) acc[q.question] = q.value;
      return acc;
    }, {} as Record<string, string>);
    
    const newData = { ...resourceData, customData };
    setResourceData(newData);
    onDataUpdate(newData);
  };
  
  // Check if Halicarnassus wonder (can retrieve discarded cards)
  const hasDiscardAbility = wonderData?.wonder?.name === 'Halicarnassus';
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🔍 Analysis Helpers</Text>
      
      {/* Resource Cards Helper */}
      <View style={styles.helperCard}>
        <Text style={styles.helperTitle}>📦 Resource Cards</Text>
        <Text style={styles.helperDescription}>
          Track resource cards for yellow card and guild calculations
        </Text>
        
        <View style={styles.inputGrid}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🟫 Brown Cards (Basic Materials)</Text>
            <TextInput
              style={styles.input}
              value={resourceData.brownCards?.toString() || ''}
              onChangeText={(text) => updateField('brownCards', parseInt(text) || 0)}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="rgba(196, 162, 76, 0.3)"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>⬜ Gray Cards (Manufactured Goods)</Text>
            <TextInput
              style={styles.input}
              value={resourceData.grayCards?.toString() || ''}
              onChangeText={(text) => updateField('grayCards', parseInt(text) || 0)}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="rgba(196, 162, 76, 0.3)"
            />
          </View>
        </View>
        
        {hasDiscardAbility && (
          <>
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                🏛️ Halicarnassus detected! Track discarded cards retrieved
              </Text>
            </View>
            
            <View style={[styles.inputGrid, { marginTop: 12 }]}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Discarded Age I</Text>
                <TextInput
                  style={styles.input}
                  value={resourceData.discardedAgeI?.toString() || ''}
                  onChangeText={(text) => updateField('discardedAgeI', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Discarded Age II</Text>
                <TextInput
                  style={styles.input}
                  value={resourceData.discardedAgeII?.toString() || ''}
                  onChangeText={(text) => updateField('discardedAgeII', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Discarded Age III</Text>
                <TextInput
                  style={styles.input}
                  value={resourceData.discardedAgeIII?.toString() || ''}
                  onChangeText={(text) => updateField('discardedAgeIII', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="rgba(196, 162, 76, 0.3)"
                />
              </View>
            </View>
          </>
        )}
      </View>
      
      {/* Customizable Questions */}
      <View style={styles.helperCard}>
        <Text style={styles.helperTitle}>📝 Custom Tracking</Text>
        <Text style={styles.helperDescription}>
          Add custom fields based on your cards and strategy
        </Text>
        
        {customQuestions.map((q) => (
          <View key={q.id} style={styles.customQuestion}>
            <TextInput
              style={[styles.input, { marginBottom: 4 }]}
              value={q.question}
              onChangeText={(text) => updateCustomQuestion(q.id, 'question', text)}
              placeholder="What to track? (e.g., 'Forging Agency uses')"
              placeholderTextColor="rgba(196, 162, 76, 0.3)"
            />
            <TextInput
              style={styles.input}
              value={q.value}
              onChangeText={(text) => updateCustomQuestion(q.id, 'value', text)}
              placeholder="Value or notes"
              placeholderTextColor="rgba(196, 162, 76, 0.3)"
            />
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.addQuestionButton}
          onPress={addCustomQuestion}
        >
          <Text style={styles.addQuestionText}>+ Add Custom Field</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          💡 This data helps calculate complex scoring patterns automatically
        </Text>
      </View>
    </View>
  );
});
