// app/scoring.tsx - Updated to use comprehensive scoring system
import React from 'react';
import { Platform, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import ComprehensiveEndGameScoring from '../components/scoring/ComprehensiveEndGameScoring';
import { useSetupStore } from '../store/setupStore';

export default function ScoringScreen() {
  const { players, seating, wonders, expansions } = useSetupStore();
  
  // Check if we have the minimum required setup
  const hasValidSetup = () => {
    if (!players || players.length < 3) return false;
    
    const orderedPlayers = seating.length > 0 
      ? seating.map(id => players.find(p => p.id === id)).filter(Boolean)
      : players;
    
    // Check if all players have wonder assignments
    const missingWonders = orderedPlayers.filter(player => 
      !player || !wonders[player.id]?.boardId
    );
    
    return missingWonders.length === 0;
  };

  // If setup is invalid, show an attractive error screen
  if (!hasValidSetup()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Setup Incomplete</Text>
            </View>
            
            <Text style={styles.errorDescription}>
              Please complete your 7 Wonders game setup before accessing the scoring calculator.
            </Text>
            
            <View style={styles.errorDetails}>
              <Text style={styles.errorDetailTitle}>Required Setup:</Text>
              <Text style={styles.errorDetailItem}>• At least 3 players</Text>
              <Text style={styles.errorDetailItem}>• Wonder assignments for all players</Text>
              <Text style={styles.errorDetailItem}>• Valid game configuration</Text>
            </View>
            
            <View style={styles.errorActions}>
              <TouchableOpacity
                style={[styles.errorButton, styles.errorButtonSecondary]}
                onPress={() => router.back()}
              >
                <Text style={[styles.errorButtonText, styles.errorButtonTextSecondary]}>
                  Go Back
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.errorButton, styles.errorButtonPrimary]}
                onPress={() => router.replace('/setup/game-summary')}
              >
                <Text style={[styles.errorButtonText, styles.errorButtonTextPrimary]}>
                  Complete Setup
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Decorative Background Elements */}
          <View style={styles.decorativeElement1} />
          <View style={styles.decorativeElement2} />
          <View style={styles.decorativeElement3} />
        </View>
      </SafeAreaView>
    );
  }

  // Valid setup - show the scoring interface with enhanced styling
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scoringWrapper}>
        {/* Optional: Add a subtle header indicator */}
        <View style={styles.scoringHeader}>
          <View style={styles.scoringHeaderContent}>
            <Text style={styles.scoringTitle}>7 Wonders Scoring</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Alert.alert(
                  'Leave Scoring?',
                  'Are you sure you want to go back? Any unsaved progress will be lost.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Leave', style: 'destructive', onPress: () => router.back() }
                  ]
                );
              }}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.gameInfo}>
            <Text style={styles.gameInfoText}>
              {players.length} Players • {Object.values(expansions).filter(Boolean).length} Expansions
            </Text>
          </View>
        </View>
        
        {/* Main Scoring Component */}
        <View style={styles.scoringContent}>
          <ComprehensiveEndGameScoring />
        </View>
      </View>
      
      {/* Subtle background pattern */}
      <View style={styles.backgroundPattern} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1A1A',
  },
  
  // Error Screen Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  errorCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 20,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  errorHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    color: 'rgba(243, 231, 211, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorDetailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorDetailItem: {
    fontSize: 13,
    color: 'rgba(243, 231, 211, 0.8)',
    marginBottom: 4,
    paddingLeft: 4,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorButtonPrimary: {
    backgroundColor: '#C4A24C',
  },
  errorButtonSecondary: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(243, 231, 211, 0.2)',
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorButtonTextPrimary: {
    color: '#1C1A1A',
  },
  errorButtonTextSecondary: {
    color: 'rgba(243, 231, 211, 0.9)',
  },
  
  // Decorative Elements
  decorativeElement1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    transform: [{ rotate: '45deg' }],
  },
  decorativeElement2: {
    position: 'absolute',
    bottom: '30%',
    right: '15%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    transform: [{ rotate: '-30deg' }],
  },
  decorativeElement3: {
    position: 'absolute',
    top: '60%',
    left: '5%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    transform: [{ rotate: '15deg' }],
  },
  
  // Valid Scoring Screen Styles
  scoringWrapper: {
    flex: 1,
  },
  scoringHeader: {
    backgroundColor: 'rgba(28, 26, 26, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 162, 76, 0.2)',
    paddingTop: Platform.OS === 'ios' ? 0 : 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  scoringHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoringTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C4A24C',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(243, 231, 211, 0.8)',
  },
  gameInfo: {
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  gameInfoText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(243, 231, 211, 0.8)',
  },
  scoringContent: {
    flex: 1,
  },
  
  // Background Pattern
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: 'transparent',
    zIndex: -1,
    ...Platform.select({
      web: {
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(196, 162, 76, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 25% 75%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)
        `,
      },
    }),
  },
});