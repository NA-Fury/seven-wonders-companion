// app/scoring.tsx - Updated to use comprehensive scoring system
import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ComprehensiveEndGameScoring from '../components/scoring/ComprehensiveEndGameScoring';

export default function ScoringScreen() {
  // Use different background for web vs mobile for optimal experience
  const backgroundColor = Platform.OS === 'web' ? '#F3E7D3' : '#1C1A1A';
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ComprehensiveEndGameScoring />
    </SafeAreaView>
  );
}