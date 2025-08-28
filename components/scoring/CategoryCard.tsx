// components/scoring/CategoryCard.tsx - Optimized category scoring input
import React, { memo, useCallback, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CategoryKey, CategoryScore } from '../../store/scoringStore';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.2)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F3E7D3',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 11,
    color: 'rgba(243, 231, 211, 0.6)',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreInput: {
    backgroundColor: 'rgba(28, 26, 26, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    textAlign: 'center',
    color: '#C4A24C',
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'rgba(196, 162, 76, 0.3)',
  },
  scoreInputFocused: {
    borderColor: '#C4A24C',
    backgroundColor: 'rgba(28, 26, 26, 0.8)',
  },
  detailButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  detailButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.4)',
    borderColor: '#818CF8',
  },
  detailButtonText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '600',
  },
  tbdLabel: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  tbdText: {
    color: '#FB923C',
    fontSize: 10,
    fontWeight: '600',
  },
  detailedContent: {
    backgroundColor: 'rgba(28, 26, 26, 0.3)',
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 162, 76, 0.1)',
  },
  detailedText: {
    color: 'rgba(243, 231, 211, 0.6)',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

interface CategoryCardProps {
  category: CategoryKey;
  score: CategoryScore | null;
  onScoreUpdate: (points: number | null) => void;
  onDetailedMode?: () => void;
  wonderData?: any;
  expansions?: any;
}

// Category display configuration
const CATEGORY_CONFIG: Record<CategoryKey, { icon: string; name: string; description: string }> = {
  wonder: { icon: '🏛️', name: 'Wonder Board', description: 'Points from wonder stages' },
  treasury: { icon: '💰', name: 'Treasury', description: '3 coins = 1 VP (minus debt)' },
  military: { icon: '⚔️', name: 'Military', description: 'Conflict victories & shields' },
  civil: { icon: '🏛️', name: 'Civil (Blue)', description: 'Civic buildings & structures' },
  commercial: { icon: '💵', name: 'Commercial (Yellow)', description: 'Trade & commerce cards' },
  science: { icon: '🔬', name: 'Science (Green)', description: 'Research & technology' },
  guild: { icon: '👔', name: 'Guilds (Purple)', description: 'Professional associations' },
  cities: { icon: '🏙️', name: 'Cities (Black)', description: 'Urban developments' },
  leaders: { icon: '👑', name: 'Leaders (White)', description: 'Historical figures' },
  navy: { icon: '⚓', name: 'Naval Conflicts', description: 'Maritime battles' },
  islands: { icon: '🏝️', name: 'Islands', description: 'Exploration rewards' },
  edifice: { icon: '🗿', name: 'Edifice', description: 'Collaborative projects' },
};

export const CategoryCard = memo<CategoryCardProps>(({
  category,
  score,
  onScoreUpdate,
  onDetailedMode,
  wonderData,
  expansions,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [inputValue, setInputValue] = useState(
    score?.directPoints !== null && score?.directPoints !== undefined ? String(score.directPoints) : ''
  );
  
  const config = CATEGORY_CONFIG[category];
  
  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
    
    // Only update if valid number or empty
    if (text === '') {
      onScoreUpdate(null);
    } else {
      const num = parseInt(text, 10);
      if (!isNaN(num)) {
        onScoreUpdate(num);
      }
    }
  }, [onScoreUpdate]);
  
  const handleDetailedToggle = useCallback(() => {
    setShowDetailed(!showDetailed);
    if (!showDetailed && onDetailedMode) {
      onDetailedMode();
    }
  }, [showDetailed, onDetailedMode]);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>
            {config.icon} {config.name}
          </Text>
          <Text style={styles.categoryDescription}>
            {config.description}
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <TextInput
            style={[
              styles.scoreInput,
              isFocused && styles.scoreInputFocused,
            ]}
            value={inputValue}
            onChangeText={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="0"
            placeholderTextColor="rgba(196, 162, 76, 0.3)"
            keyboardType="number-pad"
            maxLength={3}
            returnKeyType="done"
          />
          
          {score?.isDetailed && score.directPoints === null && (
            <View style={styles.tbdLabel}>
              <Text style={styles.tbdText}>TBD</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.detailButton,
              showDetailed && styles.detailButtonActive,
            ]}
            onPress={handleDetailedToggle}
          >
            <Text style={styles.detailButtonText}>
              {showDetailed ? 'Hide' : 'Details'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {showDetailed && (
        <View style={styles.detailedContent}>
          <Text style={styles.detailedText}>
            Detailed entry mode coming soon! Enter direct points above for now.
          </Text>
        </View>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance
  return (
    prevProps.category === nextProps.category &&
    prevProps.score?.directPoints === nextProps.score?.directPoints &&
    prevProps.score?.isDetailed === nextProps.score?.isDetailed
  );
});