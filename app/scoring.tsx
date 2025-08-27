// app/scoring.tsx - Direct route to QuickScoreScreen
import React from 'react';
import QuickScoreScreen from '../components/scoring/QuickScoreScreen';

export default function ScoringScreen() {
  // Direct render without validation - let QuickScoreScreen handle everything
  return <QuickScoreScreen />;
}