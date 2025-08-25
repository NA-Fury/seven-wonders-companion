// components/scoring/ComprehensiveEndGameScoring.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ARMADA_SHIPYARDS } from '../../data/armadaDatabase';
import { getProjectById } from '../../data/edificeDatabase';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { useSetupStore } from '../../store/setupStore';

// Types
interface PlayerScoreData {
  // Wonder
  wonderDirectPoints: number;
  wonderShowDetails: boolean;
  wonderStagesBuilt: boolean[];
  wonderEdificeStage?: { completed: boolean; edificeType?: 'I' | 'II' | 'III' };
  
  // Treasure
  treasureDirectPoints: number;
  treasureShowDetails: boolean;
  treasureTotalCoins: number;
  treasurePermanentDebt: number;
  treasureCardDebt: number;
  treasureTaxDebt: number;
  treasurePiracyDebt: number;
  treasureCommercialDebt: number;
  
  // Military
  militaryDirectPoints: number;
  militaryShowDetails: boolean;
  militaryTotalStrength: number;
  militaryStrengthPerAge: [number, number, number];
  militaryPlayedDove: boolean;
  militaryDoveAges: [boolean, boolean, boolean];
  militaryBoardingApplied: number;
  militaryBoardingReceived: number;
  militaryChainLinks: number;
  
  // Science
  scienceDirectPoints: number;
  scienceShowDetails: boolean;
  scienceCompass: number;
  scienceTablet: number;
  scienceGear: number;
  scienceNonCardCompass: number;
  scienceNonCardTablet: number;
  scienceNonCardGear: number;
  
  // Blue Cards (Civilian)
  civilianDirectPoints: number;
  civilianShowDetails: boolean;
  civilianShipPosition?: number;
  civilianChainLinks: number;
  civilianTotalCards: number;
  
  // Yellow Cards (Commercial)
  commercialDirectPoints: number;
  commercialShowDetails: boolean;
  commercialShipPosition?: number;
  commercialChainLinks: number;
  commercialTotalCards: number;
  commercialPointCards: number;
  
  // Green Cards (handled in Science)
  greenShipPosition?: number;
  
  // Purple Cards (Guilds)
  guildsDirectPoints: number;
  guildsShowDetails: boolean;
  guildsCardsPlayed: string[];
  
  // Black Cards (if Cities expansion)
  blackDirectPoints: number;
  blackShowDetails: boolean;
  blackTotalCards: number;
  blackPointCards: number;
  blackNeighborPositive: number;
  blackNeighborNegative: number;
  blackPeaceDoves: number;
  
  // Leaders (if Leaders expansion)
  leadersDirectPoints: number;
  leadersShowDetails: boolean;
  leadersPlayed: string[];
  
  // Navy (if Armada expansion)
  navyDirectPoints: number;
  navyShowDetails: boolean;
  navyTotalStrength: number;
  navyPlayedBlueDove: boolean;
  navyDoveAges: [boolean, boolean, boolean];
  
  // Islands (if Armada expansion)
  islandDirectPoints: number;
  islandShowDetails: boolean;
  islandCards: string[];
  
  // Edifice (if Edifice expansion)
  edificeDirectPoints: number;
  edificeShowDetails: boolean;
  edificeRewards: number;
  edificePenalties: number;
  edificeProjectsContributed: string[];
  
  // Resources (for analysis)
  resourcesDirectPoints: number;
  resourcesBrownCards: number;
  resourcesGreyCards: number;
  
  // Cities specific
  citiesDirectPoints: number;
  armadaDirectPoints: number;
}

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

// Optimized styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1A1A',
  },
  header: {
    backgroundColor: 'rgba(28,26,26,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 162, 76, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C4A24C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1A1A',
  },
  navButtonTextDisabled: {
    color: '#6B7280',
  },
  playerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C4A24C',
    marginBottom: 2,
  },
  playerWonder: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(243, 231, 211, 0.8)',
  },
  playerDetails: {
    fontSize: 11,
    color: 'rgba(243, 231, 211, 0.6)',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 160,
  },
  motivationalMessage: {
    backgroundColor: 'rgba(196, 162, 76, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  motivationalText: {
    color: '#FEF3C7',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.25)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(243, 231, 211, 0.1)',
  },
  cardTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C4A24C',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(243, 231, 211, 0.7)',
  },
  pointsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  pointsBadgeCalculating: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  pointsBadgeComplete: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  pointsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pointsBadgeTextCalculating: {
    color: '#FCD34D',
  },
  pointsBadgeTextComplete: {
    color: '#4ADE80',
  },
  numericInput: {
    marginBottom: 12,
  },
  numericInputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  numericInputIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  numericInputLabelText: {
    color: '#FEF3C7',
    fontSize: 13,
    fontWeight: '500',
  },
  numericInputControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numericInputButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericInputButtonActive: {
    backgroundColor: '#C4A24C',
  },
  numericInputButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  numericInputButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  numericInputButtonTextActive: {
    color: '#1C1A1A',
  },
  numericInputButtonTextDisabled: {
    color: '#6B7280',
  },
  numericInputValue: {
    minWidth: 80,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
  },
  numericInputValueText: {
    color: '#C4A24C',
    fontSize: 18,
    fontWeight: 'bold',
  },
  numericInputSuffix: {
    color: 'rgba(243, 231, 211, 0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  numericInputHelper: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  toggleButton: {
    marginBottom: 12,
  },
  toggleButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(196, 162, 76, 0.15)',
    borderColor: '#C4A24C',
  },
  toggleButtonInactive: {
    backgroundColor: 'rgba(243, 231, 211, 0.03)',
    borderColor: 'rgba(196, 162, 76, 0.2)',
  },
  toggleButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  toggleButtonContent: {
    flex: 1,
  },
  toggleButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButtonLabelActive: {
    color: '#FEF3C7',
  },
  toggleButtonLabelInactive: {
    color: 'rgba(243, 231, 211, 0.8)',
  },
  toggleButtonDescription: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  toggleButtonCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonCheckActive: {
    backgroundColor: '#C4A24C',
    borderColor: '#C4A24C',
  },
  toggleButtonCheckInactive: {
    borderColor: 'rgba(196, 162, 76, 0.5)',
  },
  toggleButtonCheckText: {
    color: '#1C1A1A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 162, 76, 0.2)',
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
  },
  totalDisplay: {
    alignItems: 'center',
    marginBottom: 10,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#C4A24C',
    marginBottom: 2,
  },
  totalDescription: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonPrimary: {
    backgroundColor: '#C4A24C',
  },
  footerButtonSecondary: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerButtonTextPrimary: {
    color: '#1C1A1A',
  },
  footerButtonTextSecondary: {
    color: '#9CA3AF',
  },
});

// Optimized Components
const MotivationalMessage = React.memo(({ message }: { message: string }) => (
  <View style={styles.motivationalMessage}>
    <Text style={styles.motivationalText}>✨ {message}</Text>
  </View>
));

interface NumericInputProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  helperText?: string;
  icon?: string;
}

const NumericInput = React.memo(({ 
  label, 
  value, 
  onChangeValue, 
  min = 0, 
  max = 100, 
  step = 1, 
  suffix = '', 
  helperText = '',
  icon = ''
}: NumericInputProps) => {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={styles.numericInput}>
      <View style={styles.numericInputLabel}>
        {icon ? <Text style={styles.numericInputIcon}>{icon}</Text> : null}
        <Text style={styles.numericInputLabelText}>{label}</Text>
      </View>
      <View style={styles.numericInputControls}>
        <TouchableOpacity
          onPress={() => canDecrement && onChangeValue(Math.max(min, value - step))}
          disabled={!canDecrement}
          style={[
            styles.numericInputButton,
            canDecrement ? styles.numericInputButtonActive : styles.numericInputButtonDisabled
          ]}
        >
          <Text style={[
            styles.numericInputButtonText,
            canDecrement ? styles.numericInputButtonTextActive : styles.numericInputButtonTextDisabled
          ]}>
            −
          </Text>
        </TouchableOpacity>
        
        <View style={styles.numericInputValue}>
          <Text style={styles.numericInputValueText}>{value}</Text>
          {suffix ? <Text style={styles.numericInputSuffix}>{suffix}</Text> : null}
        </View>
        
        <TouchableOpacity
          onPress={() => canIncrement && onChangeValue(Math.min(max, value + step))}
          disabled={!canIncrement}
          style={[
            styles.numericInputButton,
            canIncrement ? styles.numericInputButtonActive : styles.numericInputButtonDisabled
          ]}
        >
          <Text style={[
            styles.numericInputButtonText,
            canIncrement ? styles.numericInputButtonTextActive : styles.numericInputButtonTextDisabled
          ]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
      {helperText ? (
        <Text style={styles.numericInputHelper}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

interface ToggleButtonProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  description?: string;
  icon?: string;
}

const ToggleButton = React.memo(({ 
  label, 
  value, 
  onToggle,
  description = '',
  icon = ''
}: ToggleButtonProps) => (
  <View style={styles.toggleButton}>
    <TouchableOpacity 
      onPress={() => onToggle(!value)} 
      style={[
        styles.toggleButtonContainer,
        value ? styles.toggleButtonActive : styles.toggleButtonInactive
      ]}
    >
      {icon ? <Text style={styles.toggleButtonIcon}>{icon}</Text> : null}
      <View style={styles.toggleButtonContent}>
        <Text style={[
          styles.toggleButtonLabel,
          value ? styles.toggleButtonLabelActive : styles.toggleButtonLabelInactive
        ]}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.toggleButtonDescription}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={[
        styles.toggleButtonCheck,
        value ? styles.toggleButtonCheckActive : styles.toggleButtonCheckInactive
      ]}>
        {value && <Text style={styles.toggleButtonCheckText}>✓</Text>}
      </View>
    </TouchableOpacity>
  </View>
));

interface CategorySectionProps {
  title: string;
  icon: string;
  description: string;
  children: React.ReactNode;
  calculatedPoints?: number;
  isCalculating?: boolean;
  hidden?: boolean;
}

const CategorySection = React.memo(({ 
  title, 
  icon, 
  description, 
  children, 
  calculatedPoints,
  isCalculating = false,
  hidden = false
}: CategorySectionProps) => {
  if (hidden) return null;
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={styles.cardIcon}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitleText}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
        </View>
        {(isCalculating || calculatedPoints !== undefined) && (
          <View style={[
            styles.pointsBadge,
            isCalculating ? styles.pointsBadgeCalculating : styles.pointsBadgeComplete
          ]}>
            <Text style={[
              styles.pointsBadgeText,
              isCalculating ? styles.pointsBadgeTextCalculating : styles.pointsBadgeTextComplete
            ]}>
              {isCalculating ? 'Calc...' : `${calculatedPoints} pts`}
            </Text>
          </View>
        )}
      </View>
      <View>{children}</View>
    </View>
  );
});

export default function ComprehensiveEndGameScoring() {
  // Get real data from store
  const { 
    players, 
    seating, 
    expansions, 
    wonders, 
    edificeProjects 
  } = useSetupStore();

  // Get ordered players based on seating
  const orderedPlayers = useMemo(() => {
    if (!players || players.length === 0) return [];
    if (!seating || seating.length === 0) return players;
    return seating.map(id => players.find(p => p.id === id)).filter(Boolean);
  }, [players, seating]);

  // State
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerScores, setPlayerScores] = useState<{ [key: string]: PlayerScoreData }>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize scores for all players
  useEffect(() => {
    if (orderedPlayers.length === 0) return;
    
    const initialScores: { [key: string]: PlayerScoreData } = {};
    orderedPlayers.forEach(player => {
      if (!player) return;
      
      const wonderAssignment = wonders[player.id];
      const wonderData = wonderAssignment?.boardId 
        ? WONDERS_DATABASE.find(w => w.id === wonderAssignment.boardId)
        : null;
      
      const side = wonderAssignment?.side || 'day';
      const maxStages = side === 'day' 
        ? wonderData?.daySide?.stages?.length || 0 
        : wonderData?.nightSide?.stages?.length || 0;
      
      initialScores[player.id] = {
        // Wonder
        wonderDirectPoints: 0,
        wonderShowDetails: false,
        wonderStagesBuilt: new Array(maxStages).fill(false),
        wonderEdificeStage: { completed: false },
        
        // Treasure
        treasureDirectPoints: 0,
        treasureShowDetails: false,
        treasureTotalCoins: 0,
        treasurePermanentDebt: 0,
        treasureCardDebt: 0,
        treasureTaxDebt: 0,
        treasurePiracyDebt: 0,
        treasureCommercialDebt: 0,
        
        // Military
        militaryDirectPoints: 0,
        militaryShowDetails: false,
        militaryTotalStrength: 0,
        militaryStrengthPerAge: [0, 0, 0],
        militaryPlayedDove: false,
        militaryDoveAges: [false, false, false],
        militaryBoardingApplied: 0,
        militaryBoardingReceived: 0,
        militaryChainLinks: 0,
        
        // Science
        scienceDirectPoints: 0,
        scienceShowDetails: false,
        scienceCompass: 0,
        scienceTablet: 0,
        scienceGear: 0,
        scienceNonCardCompass: 0,
        scienceNonCardTablet: 0,
        scienceNonCardGear: 0,
        
        // Blue Cards
        civilianDirectPoints: 0,
        civilianShowDetails: false,
        civilianShipPosition: 0,
        civilianChainLinks: 0,
        civilianTotalCards: 0,
        
        // Yellow Cards
        commercialDirectPoints: 0,
        commercialShowDetails: false,
        commercialShipPosition: 0,
        commercialChainLinks: 0,
        commercialTotalCards: 0,
        commercialPointCards: 0,
        
        // Green ship position
        greenShipPosition: 0,
        
        // Purple Cards
        guildsDirectPoints: 0,
        guildsShowDetails: false,
        guildsCardsPlayed: [],
        
        // Black Cards
        blackDirectPoints: 0,
        blackShowDetails: false,
        blackTotalCards: 0,
        blackPointCards: 0,
        blackNeighborPositive: 0,
        blackNeighborNegative: 0,
        blackPeaceDoves: 0,
        
        // Leaders
        leadersDirectPoints: 0,
        leadersShowDetails: false,
        leadersPlayed: [],
        
        // Navy
        navyDirectPoints: 0,
        navyShowDetails: false,
        navyTotalStrength: 0,
        navyPlayedBlueDove: false,
        navyDoveAges: [false, false, false],
        
        // Islands
        islandDirectPoints: 0,
        islandShowDetails: false,
        islandCards: [],
        
        // Edifice
        edificeDirectPoints: 0,
        edificeShowDetails: false,
        edificeRewards: 0,
        edificePenalties: 0,
        edificeProjectsContributed: [],
        
        // Resources
        resourcesDirectPoints: 0,
        resourcesBrownCards: 0,
        resourcesGreyCards: 0,
        
        // Cities/Armada specific
        citiesDirectPoints: 0,
        armadaDirectPoints: 0,
      };
    });
    
    setPlayerScores(initialScores);
    setIsInitialized(true);
  }, [orderedPlayers, wonders]);

  const currentPlayer = orderedPlayers[currentPlayerIndex];
  const currentWonderAssignment = currentPlayer ? wonders[currentPlayer.id] : null;
  const currentWonder = currentWonderAssignment?.boardId 
    ? WONDERS_DATABASE.find(w => w.id === currentWonderAssignment.boardId)
    : null;
  const currentShipyard = currentWonderAssignment?.shipyardId
    ? ARMADA_SHIPYARDS.find(s => s.id === currentWonderAssignment.shipyardId)
    : null;
  
  // Safe access to current score with fallback
  const currentScore = (currentPlayer && playerScores[currentPlayer.id]) ? playerScores[currentPlayer.id] : {
    wonderDirectPoints: 0,
    wonderShowDetails: false,
    wonderStagesBuilt: [],
    treasureDirectPoints: 0,
    treasureShowDetails: false,
    treasureTotalCoins: 0,
    treasurePermanentDebt: 0,
    treasureCardDebt: 0,
    treasureTaxDebt: 0,
    treasurePiracyDebt: 0,
    treasureCommercialDebt: 0,
    militaryDirectPoints: 0,
    militaryShowDetails: false,
    militaryTotalStrength: 0,
    militaryStrengthPerAge: [0, 0, 0] as [number, number, number],
    militaryPlayedDove: false,
    militaryDoveAges: [false, false, false] as [boolean, boolean, boolean],
    militaryBoardingApplied: 0,
    militaryBoardingReceived: 0,
    militaryChainLinks: 0,
    scienceDirectPoints: 0,
    scienceShowDetails: false,
    scienceCompass: 0,
    scienceTablet: 0,
    scienceGear: 0,
    scienceNonCardCompass: 0,
    scienceNonCardTablet: 0,
    scienceNonCardGear: 0,
    civilianDirectPoints: 0,
    civilianShowDetails: false,
    civilianShipPosition: 0,
    civilianChainLinks: 0,
    civilianTotalCards: 0,
    commercialDirectPoints: 0,
    commercialShowDetails: false,
    commercialShipPosition: 0,
    commercialChainLinks: 0,
    commercialTotalCards: 0,
    commercialPointCards: 0,
    greenShipPosition: 0,
    guildsDirectPoints: 0,
    guildsShowDetails: false,
    guildsCardsPlayed: [],
    blackDirectPoints: 0,
    blackShowDetails: false,
    blackTotalCards: 0,
    blackPointCards: 0,
    blackNeighborPositive: 0,
    blackNeighborNegative: 0,
    blackPeaceDoves: 0,
    leadersDirectPoints: 0,
    leadersShowDetails: false,
    leadersPlayed: [],
    navyDirectPoints: 0,
    navyShowDetails: false,
    navyTotalStrength: 0,
    navyPlayedBlueDove: false,
    navyDoveAges: [false, false, false] as [boolean, boolean, boolean],
    islandDirectPoints: 0,
    islandShowDetails: false,
    islandCards: [],
    edificeDirectPoints: 0,
    edificeShowDetails: false,
    edificeRewards: 0,
    edificePenalties: 0,
    edificeProjectsContributed: [],
    resourcesDirectPoints: 0,
    resourcesBrownCards: 0,
    resourcesGreyCards: 0,
    citiesDirectPoints: 0,
    armadaDirectPoints: 0,
    wonderEdificeStage: { completed: false },
  } as PlayerScoreData;

  const updatePlayerScore = useCallback((field: string, value: any) => {
    if (!currentPlayer) return;
    setPlayerScores(prev => ({
      ...prev,
      [currentPlayer.id]: {
        ...prev[currentPlayer.id],
        [field]: value
      }
    }));
  }, [currentPlayer]);

  // Calculation functions with safe access
  const calculateWonderPoints = useCallback(() => {
    if (!currentScore || !currentScore.wonderShowDetails) {
      return currentScore?.wonderDirectPoints || 0;
    }
    const stages = currentScore.wonderStagesBuilt || [];
    const side = currentWonderAssignment?.side || 'day';
    const stageData = side === 'day' ? currentWonder?.daySide?.stages : currentWonder?.nightSide?.stages;
    
    return stages.reduce((sum, built, index) => {
      if (!built || !stageData?.[index]) return sum;
      return sum + (stageData[index].points || stageData[index].effect?.value || 0);
    }, 0);
  }, [currentScore, currentWonder, currentWonderAssignment]);

  const calculateTreasurePoints = useCallback(() => {
    if (!currentScore || !currentScore.treasureShowDetails) {
      return currentScore?.treasureDirectPoints || 0;
    }
    
    const totalDebts = (currentScore.treasurePermanentDebt || 0) +
                       (currentScore.treasureCardDebt || 0) +
                       (currentScore.treasureTaxDebt || 0) +
                       (currentScore.treasurePiracyDebt || 0) +
                       (currentScore.treasureCommercialDebt || 0);
    
    const netCoins = (currentScore.treasureTotalCoins || 0) - totalDebts;
    return Math.floor(netCoins / 3);
  }, [currentScore]);

  const calculateSciencePoints = useCallback(() => {
    if (!currentScore || !currentScore.scienceShowDetails) {
      return currentScore?.scienceDirectPoints || 0;
    }
    
    const totalCompass = (currentScore.scienceCompass || 0) + (currentScore.scienceNonCardCompass || 0);
    const totalTablet = (currentScore.scienceTablet || 0) + (currentScore.scienceNonCardTablet || 0);
    const totalGear = (currentScore.scienceGear || 0) + (currentScore.scienceNonCardGear || 0);
    
    const sets = Math.min(totalCompass, totalTablet, totalGear);
    const squares = (totalCompass * totalCompass) + (totalTablet * totalTablet) + (totalGear * totalGear);
    
    return (sets * 7) + squares;
  }, [currentScore]);

  const calculateTotal = useCallback(() => {
    if (!currentScore) return 0;
    
    const wonder = calculateWonderPoints();
    const treasure = calculateTreasurePoints();
    const science = calculateSciencePoints();
    const civilian = currentScore.civilianDirectPoints || 0;
    const commercial = currentScore.commercialDirectPoints || 0;
    const guilds = currentScore.guildsDirectPoints || 0;
    const military = currentScore.militaryDirectPoints || 0;
    
    let total = wonder + treasure + science + civilian + commercial + guilds + military;
    
    if (expansions?.cities) {
      total += currentScore.blackDirectPoints || 0;
      total += currentScore.citiesDirectPoints || 0;
    }
    
    if (expansions?.leaders) {
      total += currentScore.leadersDirectPoints || 0;
    }
    
    if (expansions?.armada) {
      total += currentScore.navyDirectPoints || 0;
      total += currentScore.islandDirectPoints || 0;
      total += currentScore.armadaDirectPoints || 0;
    }
    
    if (expansions?.edifice) {
      total += currentScore.edificeDirectPoints || 0;
    }
    
    return total;
  }, [currentScore, calculateWonderPoints, calculateTreasurePoints, calculateSciencePoints, expansions]);

  const navigateToPlayer = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    } else if (direction === 'next' && currentPlayerIndex < orderedPlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  }, [currentPlayerIndex, orderedPlayers.length]);

  const allPlayersHaveScores = useCallback(() => {
    return orderedPlayers.every(player => {
      if (!player) return false;
      const score = playerScores[player.id];
      if (!score) return false;
      
      // Check if player has entered any points
      const hasAnyPoints = Object.entries(score).some(([key, value]) => {
        if (key.includes('DirectPoints') && typeof value === 'number') {
          return value > 0;
        }
        return false;
      });
      
      return hasAnyPoints;
    });
  }, [orderedPlayers, playerScores]);

  const handleSeeResults = useCallback(() => {
    Alert.alert(
      '🎉 Game Complete!',
      'All players have entered their scores. Ready to see the final results and analysis?',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { 
          text: 'See Results', 
          style: 'default',
          onPress: () => {
            // Navigate to results screen or show results modal
            console.log('Navigate to results');
          }
        }
      ]
    );
  }, []);

  // Show loading state while initializing
  if (!isInitialized || orderedPlayers.length === 0 || !currentPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: 20,
          backgroundColor: '#1C1A1A'
        }}>
          <View style={{
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            maxWidth: 300,
            width: '100%',
          }}>
            {/* Loading Spinner */}
            <View style={{
              width: 40,
              height: 40,
              borderWidth: 4,
              borderColor: 'rgba(196, 162, 76, 0.3)',
              borderTopColor: '#C4A24C',
              borderRadius: 20,
              marginBottom: 20,
              // Add rotation animation here if needed
            }} />
            
            <Text style={{ 
              color: '#C4A24C', 
              fontSize: 18, 
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8
            }}>
              🎯 Initializing Scoring
            </Text>
            
            <Text style={{ 
              color: 'rgba(243, 231, 211, 0.8)', 
              fontSize: 14, 
              textAlign: 'center',
              lineHeight: 20
            }}>
              Setting up scoring calculator for {orderedPlayers.length || players?.length || 0} players...
            </Text>
            
            <View style={{
              marginTop: 20,
              backgroundColor: 'rgba(196, 162, 76, 0.1)',
              borderRadius: 8,
              padding: 12,
              width: '100%',
            }}>
              <Text style={{ 
                color: 'rgba(243, 231, 211, 0.7)', 
                fontSize: 12, 
                textAlign: 'center' 
              }}>
                Loading game data and player configurations...
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigateToPlayer('prev')}
            disabled={currentPlayerIndex === 0}
            style={[
              styles.navButton,
              currentPlayerIndex === 0 && styles.navButtonDisabled
            ]}
          >
            <Text style={[
              styles.navButtonText,
              currentPlayerIndex === 0 && styles.navButtonTextDisabled
            ]}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{currentPlayer.name}</Text>
            <Text style={styles.playerWonder}>
              🏛️ {currentWonder?.name || 'No Wonder'} ({currentWonderAssignment?.side || 'day'})
            </Text>
            {currentShipyard && (
              <Text style={styles.playerDetails}>
                ⚓ {currentShipyard.name}
              </Text>
            )}
            <Text style={styles.playerDetails}>
              Player {currentPlayerIndex + 1} of {orderedPlayers.length} • {currentDate} {currentTime}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigateToPlayer('next')}
            disabled={currentPlayerIndex === orderedPlayers.length - 1}
            style={[
              styles.navButton,
              currentPlayerIndex === orderedPlayers.length - 1 && styles.navButtonDisabled
            ]}
          >
            <Text style={[
              styles.navButtonText,
              currentPlayerIndex === orderedPlayers.length - 1 && styles.navButtonTextDisabled
            ]}>
              ›
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MotivationalMessage 
          message="The more details you enter, the more analysis can be run personally for you!" 
        />

        {/* 1. Wonder Board Points */}
        <CategorySection
          title="Wonder Board Points"
          icon="🏛️"
          description={`${currentWonder?.name || 'Wonder'} - ${currentWonderAssignment?.side || 'day'} side`}
          calculatedPoints={currentScore.wonderShowDetails ? calculateWonderPoints() : currentScore.wonderDirectPoints}
        >
          <ToggleButton
            label="Enter detailed stage information"
            value={currentScore.wonderShowDetails || false}
            onToggle={(value) => updatePlayerScore('wonderShowDetails', value)}
            icon="📋"
            description="Track which wonder stages you completed"
          />

          {!currentScore.wonderShowDetails ? (
            <NumericInput 
              label="Wonder Points Total" 
              value={currentScore.wonderDirectPoints || 0} 
              onChangeValue={(value) => updatePlayerScore('wonderDirectPoints', value)} 
              min={0} 
              max={50} 
              suffix="points" 
              icon="🏛️"
            />
          ) : (
            <View>
              <Text style={[styles.cardTitleText, { marginBottom: 10, fontSize: 14 }]}>
                Wonder Stages Built
              </Text>
              {((currentWonderAssignment?.side === 'day'
                  ? currentWonder?.daySide?.stages
                  : currentWonder?.nightSide?.stages) || []
              ).map((stage, index) => (
                <ToggleButton
                  key={index}
                  label={`Stage ${index + 1} (${stage.points || stage.effect?.value || 0} pts)`}
                  value={currentScore.wonderStagesBuilt?.[index] || false}
                  onToggle={(value) => {
                    const newStages = [...(currentScore.wonderStagesBuilt || [])];
                    newStages[index] = value;
                    updatePlayerScore('wonderStagesBuilt', newStages);
                  }}
                  icon="🏗️"
                  description={stage.effect?.description || ''}
                />
              ))}
              
              {expansions?.edifice && (
                <View style={{ marginTop: 10 }}>
                  <ToggleButton
                    label="Edifice built on Wonder stage?"
                    value={currentScore.wonderEdificeStage?.completed || false}
                    onToggle={(value) => updatePlayerScore('wonderEdificeStage', { 
                      ...currentScore.wonderEdificeStage, 
                      completed: value 
                    })}
                    icon="🗿"
                    description="Did you complete an Edifice on a wonder stage?"
                  />
                </View>
              )}
            </View>
          )}
        </CategorySection>

        {/* 2. Treasure (Coins) */}
        <CategorySection
          title="Treasure (Coins)"
          icon="💰"
          description="3 coins = 1 point, minus all debts"
          calculatedPoints={currentScore.treasureShowDetails ? calculateTreasurePoints() : currentScore.treasureDirectPoints}
        >
          <ToggleButton
            label="Enter detailed coin breakdown"
            value={currentScore.treasureShowDetails || false}
            onToggle={(value) => updatePlayerScore('treasureShowDetails', value)}
            icon="💳"
            description="Track coins and debts for precise calculation"
          />

          {!currentScore.treasureShowDetails ? (
            <NumericInput 
              label="Treasure Points Total" 
              value={currentScore.treasureDirectPoints || 0} 
              onChangeValue={(value) => updatePlayerScore('treasureDirectPoints', value)} 
              min={-20} 
              max={50} 
              suffix="points" 
              icon="💰"
            />
          ) : (
            <View>
              <NumericInput
                label="Total Coins in Possession"
                value={currentScore.treasureTotalCoins || 0}
                onChangeValue={(value) => updatePlayerScore('treasureTotalCoins', value)}
                min={0}
                max={150}
                suffix="coins"
                helperText="All coins at game end"
                icon="🪙"
              />
              <NumericInput
                label="Permanent Debt"
                value={currentScore.treasurePermanentDebt || 0}
                onChangeValue={(value) => updatePlayerScore('treasurePermanentDebt', value)}
                min={0}
                max={50}
                suffix="debt"
                icon="📉"
              />
              {expansions.cities && (
                <>
                  <NumericInput
                    label="Debt from Cards"
                    value={currentScore.treasureCardDebt || 0}
                    onChangeValue={(value) => updatePlayerScore('treasureCardDebt', value)}
                    min={0}
                    max={50}
                    suffix="debt"
                    icon="🃏"
                  />
                  <NumericInput
                    label="Tax Debt"
                    value={currentScore.treasureTaxDebt || 0}
                    onChangeValue={(value) => updatePlayerScore('treasureTaxDebt', value)}
                    min={0}
                    max={50}
                    suffix="debt"
                    icon="📋"
                  />
                </>
              )}
              {expansions.armada && (
                <>
                  <NumericInput
                    label="Piracy Debt"
                    value={currentScore.treasurePiracyDebt || 0}
                    onChangeValue={(value) => updatePlayerScore('treasurePiracyDebt', value)}
                    min={0}
                    max={50}
                    suffix="debt"
                    icon="🏴‍☠️"
                  />
                  <NumericInput
                    label="Commercial Pot Taxes"
                    value={currentScore.treasureCommercialDebt || 0}
                    onChangeValue={(value) => updatePlayerScore('treasureCommercialDebt', value)}
                    min={0}
                    max={50}
                    suffix="debt"
                    icon="🏺"
                  />
                </>
              )}
            </View>
          )}
        </CategorySection>

        {/* 3. Military Points */}
        <CategorySection
          title="Military Conflicts"
          icon="⚔️"
          description="Victory points from military strength"
          calculatedPoints={currentScore.militaryDirectPoints}
        >
          <ToggleButton
            label="Enter detailed military information"
            value={currentScore.militaryShowDetails || false}
            onToggle={(value) => updatePlayerScore('militaryShowDetails', value)}
            icon="🛡️"
            description="Track military strength per age"
          />

          {!currentScore.militaryShowDetails ? (
            <NumericInput 
              label="Military Points Total" 
              value={currentScore.militaryDirectPoints || 0} 
              onChangeValue={(value) => updatePlayerScore('militaryDirectPoints', value)} 
              min={-6} 
              max={40} 
              suffix="points" 
              icon="⚔️"
            />
          ) : (
            <View>
              <NumericInput
                label="Total Military Strength"
                value={currentScore.militaryTotalStrength || 0}
                onChangeValue={(value) => updatePlayerScore('militaryTotalStrength', value)}
                min={0}
                max={20}
                suffix="shields"
                icon="🛡️"
              />
              
              {expansions.cities && (
                <ToggleButton
                  label="Played Red Dove Diplomacy Token?"
                  value={currentScore.militaryPlayedDove || false}
                  onToggle={(value) => updatePlayerScore('militaryPlayedDove', value)}
                  icon="🕊️"
                  description="Skip military conflicts in selected ages"
                />
              )}
              
              {currentScore.militaryPlayedDove && (
                <View>
                  <Text style={[styles.cardDescription, { marginBottom: 8 }]}>
                    Which ages did you play the dove?
                  </Text>
                  {[1, 2, 3].map((age) => (
                    <ToggleButton
                      key={age}
                      label={`Age ${age}`}
                      value={currentScore.militaryDoveAges?.[age - 1] || false}
                      onToggle={(value) => {
                        const newAges = [...(currentScore.militaryDoveAges || [false, false, false])];
                        newAges[age - 1] = value;
                        updatePlayerScore('militaryDoveAges', newAges);
                      }}
                      icon="🏛️"
                    />
                  ))}
                </View>
              )}
              
              {expansions.armada && (
                <>
                  <NumericInput
                    label="Military Boarding Applied"
                    value={currentScore.militaryBoardingApplied || 0}
                    onChangeValue={(value) => updatePlayerScore('militaryBoardingApplied', value)}
                    min={0}
                    max={10}
                    icon="🚢"
                  />
                  <NumericInput
                    label="Military Boarding Received"
                    value={currentScore.militaryBoardingReceived || 0}
                    onChangeValue={(value) => updatePlayerScore('militaryBoardingReceived', value)}
                    min={0}
                    max={10}
                    icon="⚓"
                  />
                </>
              )}
              
              <NumericInput
                label="Chain Links Used"
                value={currentScore.militaryChainLinks || 0}
                onChangeValue={(value) => updatePlayerScore('militaryChainLinks', value)}
                min={0}
                max={10}
                icon="🔗"
              />
            </View>
          )}
        </CategorySection>

        {/* 4. Blue Cards (Civilian) */}
        <CategorySection
          title="Civilian Structures"
          icon="🏛️"
          description="Blue cards providing victory points"
          calculatedPoints={currentScore.civilianDirectPoints}
        >
          <ToggleButton
            label="Enter detailed information"
            value={currentScore.civilianShowDetails || false}
            onToggle={(value) => updatePlayerScore('civilianShowDetails', value)}
            icon="📊"
            description="Track blue cards and shipyard position"
          />

          {!currentScore.civilianShowDetails ? (
            <NumericInput 
              label="Civilian Points Total" 
              value={currentScore.civilianDirectPoints || 0} 
              onChangeValue={(value) => updatePlayerScore('civilianDirectPoints', value)} 
              min={0} 
              max={60} 
              suffix="points" 
              icon="🏛️"
            />
          ) : (
            <View>
              {expansions.armada && currentShipyard && (
                <NumericInput
                  label="Blue Ship Position"
                  value={currentScore.civilianShipPosition || 0}
                  onChangeValue={(value) => updatePlayerScore('civilianShipPosition', value)}
                  min={0}
                  max={6}
                  suffix="position"
                  icon="🚢"
                  helperText="Position on shipyard blue track (0-6)"
                />
              )}
              
              <NumericInput
                label="Blue Cards Played"
                value={currentScore.civilianTotalCards || 0}
                onChangeValue={(value) => updatePlayerScore('civilianTotalCards', value)}
                min={0}
                max={20}
                suffix="cards"
                icon="🃏"
              />
              
              <NumericInput
                label="Chain Links Used"
                value={currentScore.civilianChainLinks || 0}
                onChangeValue={(value) => updatePlayerScore('civilianChainLinks', value)}
                min={0}
                max={10}
                icon="🔗"
              />
            </View>
          )}
        </CategorySection>

        {/* 5. Yellow Cards (Commercial) */}
        <CategorySection
          title="Commercial Structures"
          icon="🪙"
          description="Yellow cards providing coins and points"
          calculatedPoints={currentScore.commercialDirectPoints}
        >
          <ToggleButton
            label="Enter detailed information"
            value={currentScore.commercialShowDetails || false}
            onToggle={(value) => updatePlayerScore('commercialShowDetails', value)}
            icon="💵"
            description="Track yellow cards and bonuses"
          />

          {!currentScore.commercialShowDetails ? (
            <NumericInput 
              label="Commercial Points Total" 
              value={currentScore.commercialDirectPoints || 0} 
              onChangeValue={(value) => updatePlayerScore('commercialDirectPoints', value)} 
              min={0} 
              max={40} 
              suffix="points" 
              icon="🪙"
            />
          ) : (
            <View>
              {expansions.armada && currentShipyard && (
                <NumericInput
                  label="Yellow Ship Position"
                  value={currentScore.commercialShipPosition || 0}
                  onChangeValue={(value) => updatePlayerScore('commercialShipPosition', value)}
                  min={0}
                  max={6}
                  suffix="position"
                  icon="🚢"
                  helperText="Position on shipyard yellow track (0-6)"
                />
              )}
              
              <NumericInput
                label="Yellow Cards Played"
                value={currentScore.commercialTotalCards || 0}
                onChangeValue={(value) => updatePlayerScore('commercialTotalCards', value)}
                min={0}
                max={20}
                suffix="cards"
                icon="🃏"
              />
              
              <NumericInput
                label="Point-Giving Yellow Cards"
                value={currentScore.commercialPointCards || 0}
                onChangeValue={(value) => updatePlayerScore('commercialPointCards', value)}
                min={0}
                max={10}
                suffix="cards"
                icon="⭐"
              />
              
              <NumericInput
                label="Chain Links Used"
                value={currentScore.commercialChainLinks || 0}
                onChangeValue={(value) => updatePlayerScore('commercialChainLinks', value)}
                min={0}
                max={10}
                icon="🔗"
              />
            </View>
          )}
        </CategorySection>

        {/* 6. Science Structures (Green) */}
        <CategorySection
          title="Science Structures"
          icon="🔬"
          description="Green cards with science symbols"
          calculatedPoints={currentScore.scienceShowDetails ? calculateSciencePoints() : currentScore.scienceDirectPoints}
        >
          <ToggleButton
            label="Enter science symbol breakdown"
            value={currentScore.scienceShowDetails || false}
            onToggle={(value) => updatePlayerScore('scienceShowDetails', value)}
            icon="⚗️"
            description="Track individual science symbols"
          />

          {!currentScore.scienceShowDetails ? (
            <NumericInput
              label="Science Points Total"
              value={currentScore.scienceDirectPoints || 0}
              onChangeValue={(value) => updatePlayerScore('scienceDirectPoints', value)}
              min={0}
              max={100}
              suffix="points"
              icon="🔬"
            />
          ) : (
            <View>
              {expansions.armada && currentShipyard && (
                <NumericInput
                  label="Green Ship Position"
                  value={currentScore.greenShipPosition || 0}
                  onChangeValue={(value) => updatePlayerScore('greenShipPosition', value)}
                  min={0}
                  max={6}
                  suffix="position"
                  icon="🚢"
                  helperText="Position on shipyard green track (0-6)"
                />
              )}
              
              <Text style={[styles.cardDescription, { marginBottom: 8, marginTop: 10 }]}>
                Science symbols from cards:
              </Text>
              
              <NumericInput
                label="Compass/Astrolabe"
                value={currentScore.scienceCompass || 0}
                onChangeValue={(value) => updatePlayerScore('scienceCompass', value)}
                min={0}
                max={10}
                suffix="symbols"
                icon="🧭"
              />
              <NumericInput
                label="Stone Tablet"
                value={currentScore.scienceTablet || 0}
                onChangeValue={(value) => updatePlayerScore('scienceTablet', value)}
                min={0}
                max={10}
                suffix="symbols"
                icon="📜"
              />
              <NumericInput
                label="Gear/Cog"
                value={currentScore.scienceGear || 0}
                onChangeValue={(value) => updatePlayerScore('scienceGear', value)}
                min={0}
                max={10}
                suffix="symbols"
                icon="⚙️"
              />
              
              <Text style={[styles.cardDescription, { marginBottom: 8, marginTop: 10 }]}>
                Additional symbols (from leaders, wonders, etc.):
              </Text>
              
              <NumericInput
                label="Extra Compass"
                value={currentScore.scienceNonCardCompass || 0}
                onChangeValue={(value) => updatePlayerScore('scienceNonCardCompass', value)}
                min={0}
                max={5}
                suffix="symbols"
                icon="🧭"
              />
              <NumericInput
                label="Extra Tablet"
                value={currentScore.scienceNonCardTablet || 0}
                onChangeValue={(value) => updatePlayerScore('scienceNonCardTablet', value)}
                min={0}
                max={5}
                suffix="symbols"
                icon="📜"
              />
              <NumericInput
                label="Extra Gear"
                value={currentScore.scienceNonCardGear || 0}
                onChangeValue={(value) => updatePlayerScore('scienceNonCardGear', value)}
                min={0}
                max={5}
                suffix="symbols"
                icon="⚙️"
              />
            </View>
          )}
        </CategorySection>

        {/* 7. Purple Cards (Guilds) */}
        <CategorySection
          title="Guild Cards"
          icon="👑"
          description="Purple cards providing neighbor-dependent points"
          calculatedPoints={currentScore.guildsDirectPoints}
        >
          <NumericInput 
            label="Guild Points Total" 
            value={currentScore.guildsDirectPoints || 0} 
            onChangeValue={(value) => updatePlayerScore('guildsDirectPoints', value)} 
            min={0} 
            max={50} 
            suffix="points" 
            icon="👑"
          />
        </CategorySection>

        {/* 8. Black Cards (Cities Expansion) */}
        {expansions.cities && (
          <CategorySection
            title="Black Cards (Cities)"
            icon="🏴"
            description="Cities expansion black cards"
            calculatedPoints={currentScore.blackDirectPoints}
          >
            <ToggleButton
              label="Enter detailed information"
              value={currentScore.blackShowDetails || false}
              onToggle={(value) => updatePlayerScore('blackShowDetails', value)}
              icon="📊"
              description="Track black cards and effects"
            />

            {!currentScore.blackShowDetails ? (
              <NumericInput 
                label="Black Cards Points Total" 
                value={currentScore.blackDirectPoints || 0} 
                onChangeValue={(value) => updatePlayerScore('blackDirectPoints', value)} 
                min={-20} 
                max={50} 
                suffix="points" 
                icon="🏴"
              />
            ) : (
              <View>
                <NumericInput
                  label="Total Black Cards"
                  value={currentScore.blackTotalCards || 0}
                  onChangeValue={(value) => updatePlayerScore('blackTotalCards', value)}
                  min={0}
                  max={15}
                  suffix="cards"
                  icon="🃏"
                />
                
                <NumericInput
                  label="Point-Giving Black Cards"
                  value={currentScore.blackPointCards || 0}
                  onChangeValue={(value) => updatePlayerScore('blackPointCards', value)}
                  min={0}
                  max={10}
                  suffix="cards"
                  icon="⭐"
                />
                
                <NumericInput
                  label="Positive Neighbor Effects"
                  value={currentScore.blackNeighborPositive || 0}
                  onChangeValue={(value) => updatePlayerScore('blackNeighborPositive', value)}
                  min={0}
                  max={10}
                  icon="✅"
                />
                
                <NumericInput
                  label="Negative Neighbor Effects"
                  value={currentScore.blackNeighborNegative || 0}
                  onChangeValue={(value) => updatePlayerScore('blackNeighborNegative', value)}
                  min={0}
                  max={10}
                  icon="❌"
                />
                
                <NumericInput
                  label="Peace Dove Tokens"
                  value={currentScore.blackPeaceDoves || 0}
                  onChangeValue={(value) => updatePlayerScore('blackPeaceDoves', value)}
                  min={0}
                  max={3}
                  icon="🕊️"
                />
              </View>
            )}
          </CategorySection>
        )}

        {/* 9. Leaders (Leaders Expansion) */}
        {expansions.leaders && (
          <CategorySection
            title="Leaders"
            icon="👤"
            description="Leader cards with special abilities"
            calculatedPoints={currentScore.leadersDirectPoints}
          >
            <NumericInput 
              label="Leaders Points Total" 
              value={currentScore.leadersDirectPoints || 0} 
              onChangeValue={(value) => updatePlayerScore('leadersDirectPoints', value)} 
              min={0} 
              max={50} 
              suffix="points" 
              icon="👤"
            />
          </CategorySection>
        )}

        {/* 10. Navy (Armada Expansion) */}
        {expansions.armada && (
          <CategorySection
            title="Naval Conflicts"
            icon="⚓"
            description="Naval strength and conflicts"
            calculatedPoints={currentScore.navyDirectPoints}
          >
            <ToggleButton
              label="Enter detailed naval information"
              value={currentScore.navyShowDetails || false}
              onToggle={(value) => updatePlayerScore('navyShowDetails', value)}
              icon="🚢"
              description="Track naval strength and battles"
            />

            {!currentScore.navyShowDetails ? (
              <NumericInput 
                label="Navy Points Total" 
                value={currentScore.navyDirectPoints || 0} 
                onChangeValue={(value) => updatePlayerScore('navyDirectPoints', value)} 
                min={-6} 
                max={40} 
                suffix="points" 
                icon="⚓"
              />
            ) : (
              <View>
                <NumericInput
                  label="Total Naval Strength"
                  value={currentScore.navyTotalStrength || 0}
                  onChangeValue={(value) => updatePlayerScore('navyTotalStrength', value)}
                  min={0}
                  max={20}
                  suffix="anchors"
                  icon="⚓"
                />
                
                <ToggleButton
                  label="Played Blue Dove Token?"
                  value={currentScore.navyPlayedBlueDove || false}
                  onToggle={(value) => updatePlayerScore('navyPlayedBlueDove', value)}
                  icon="🕊️"
                  description="Skip naval conflicts in selected ages"
                />
                
                {currentScore.navyPlayedBlueDove && (
                  <View>
                    <Text style={[styles.cardDescription, { marginBottom: 8 }]}>
                      Which ages did you play the blue dove?
                    </Text>
                    {[1, 2, 3].map((age) => (
                      <ToggleButton
                        key={age}
                        label={`Age ${age}`}
                        value={currentScore.navyDoveAges?.[age - 1] || false}
                        onToggle={(value) => {
                          const newAges = [...(currentScore.navyDoveAges || [false, false, false])];
                          newAges[age - 1] = value;
                          updatePlayerScore('navyDoveAges', newAges);
                        }}
                        icon="🏛️"
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </CategorySection>
        )}

        {/* 11. Island Cards (Armada Expansion) */}
        {expansions.armada && (
          <CategorySection
            title="Island Cards"
            icon="🏝️"
            description="Island exploration cards"
            calculatedPoints={currentScore.islandDirectPoints}
          >
            <NumericInput 
              label="Island Cards Points Total" 
              value={currentScore.islandDirectPoints || 0} 
              onChangeValue={(value) => updatePlayerScore('islandDirectPoints', value)} 
              min={0} 
              max={50} 
              suffix="points" 
              icon="🏝️"
            />
          </CategorySection>
        )}

        {/* 12. Edifice (Edifice Expansion) */}
        {expansions.edifice && (
          <CategorySection
            title="Edifice Projects"
            icon="🗿"
            description="Rewards and penalties from Edifice projects"
            calculatedPoints={currentScore.edificeDirectPoints}
          >
            <ToggleButton
              label="Enter detailed Edifice information"
              value={currentScore.edificeShowDetails || false}
              onToggle={(value) => updatePlayerScore('edificeShowDetails', value)}
              icon="🏗️"
              description="Track contributions and completions"
            />

            {!currentScore.edificeShowDetails ? (
              <NumericInput 
                label="Edifice Points Total" 
                value={currentScore.edificeDirectPoints || 0} 
                onChangeValue={(value) => updatePlayerScore('edificeDirectPoints', value)} 
                min={-20} 
                max={50} 
                suffix="points" 
                icon="🗿"
              />
            ) : (
              <View>
                <NumericInput
                  label="Edifice Rewards"
                  value={currentScore.edificeRewards || 0}
                  onChangeValue={(value) => updatePlayerScore('edificeRewards', value)}
                  min={0}
                  max={50}
                  suffix="points"
                  icon="✅"
                />
                
                <NumericInput
                  label="Edifice Penalties"
                  value={currentScore.edificePenalties || 0}
                  onChangeValue={(value) => updatePlayerScore('edificePenalties', value)}
                  min={0}
                  max={20}
                  suffix="points"
                  icon="❌"
                  helperText="Points lost from uncompleted projects"
                />
                
                <Text style={[styles.cardDescription, { marginBottom: 8, marginTop: 10 }]}>
                  Which projects did you contribute to?
                </Text>
                
                {['age1', 'age2', 'age3'].map((ageKey) => {
                  const projectId = edificeProjects[ageKey as keyof typeof edificeProjects];
                  if (!projectId) return null;

                  const project = getProjectById(projectId);
                  if (!project) return null;
                  
                  return (
                    <ToggleButton
                      key={ageKey}
                      label={`Age ${ageKey.slice(-1)}: ${project.name}`}
                      value={currentScore.edificeProjectsContributed?.includes(projectId) || false}
                      onToggle={(value) => {
                        const contributed = currentScore.edificeProjectsContributed || [];
                        if (value && !contributed.includes(projectId)) {
                          updatePlayerScore('edificeProjectsContributed', [...contributed, projectId]);
                        } else if (!value) {
                          updatePlayerScore('edificeProjectsContributed', contributed.filter(id => id !== projectId));
                        }
                      }}
                      icon="🏗️"
                      description={project.effect.description}
                    />
                  );
                })}
              </View>
            )}
          </CategorySection>
        )}

        {/* Extra space at bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalDisplay}>
          <Text style={styles.totalValue}>
            Total: {calculateTotal()} points
          </Text>
          <Text style={[styles.totalDescription, { color: '#4ADE80' }]}>
            {currentScore.wonderShowDetails || currentScore.treasureShowDetails || currentScore.scienceShowDetails
              ? 'Calculated from details'
              : 'Direct entry'
            }
          </Text>
        </View>

        <View style={styles.footerButtons}>
          {currentPlayerIndex > 0 && (
            <TouchableOpacity
              onPress={() => navigateToPlayer('prev')}
              style={[styles.footerButton, styles.footerButtonPrimary]}
            >
              <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>
                ◀ {orderedPlayers[currentPlayerIndex - 1]?.name}
              </Text>
            </TouchableOpacity>
          )}
          
          {currentPlayerIndex < orderedPlayers.length - 1 && (
            <TouchableOpacity
              onPress={() => navigateToPlayer('next')}
              style={[styles.footerButton, styles.footerButtonPrimary]}
            >
              <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>
                {orderedPlayers[currentPlayerIndex + 1]?.name} ▶
              </Text>
            </TouchableOpacity>
          )}
          
          {allPlayersHaveScores() && (
            <TouchableOpacity
              onPress={handleSeeResults}
              style={[styles.footerButton, { backgroundColor: '#22C55E' }]}
            >
              <Text style={[styles.footerButtonText, { color: '#FFFFFF' }]}>
                🏆 See Results
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}