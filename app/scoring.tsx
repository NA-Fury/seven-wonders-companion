// app/scoring.tsx - FIXED to prevent infinite re-renders
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import SevenWondersEndGameScoring from '../components/scoring/SevenWondersEndGameScoring';

export default function ScoringScreen() {
  // Use different background for web vs mobile
  const backgroundColor = Platform.OS === 'web' ? '#F3E7D3' : '#1C1A1A';
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <SevenWondersEndGameScoring />
    </SafeAreaView>
  );
}