// components/ui/scoring.tsx - UI Components for Scoring System
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Card } from './index';

// Import the scoring engine for the results component
import { Enhanced7WondersScoringEngine } from '../../lib/scoring/enhancedScoringEngine';
import type { PlayerScore } from '../../types/game';

// Numeric Input Component
interface NumericInputProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  helperText?: string;
}

export function NumericInput({
  label,
  value,
  onChangeValue,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  helperText
}: NumericInputProps) {
  const [tempValue, setTempValue] = useState(value.toString());

  const handleTextChange = (text: string) => {
    setTempValue(text);
    const numValue = parseInt(text) || 0;
    if (numValue >= min && numValue <= max) {
      onChangeValue(numValue);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onChangeValue(value + step);
      setTempValue((value + step).toString());
    }
  };

  const handleDecrement = () => {
    if (value - step >= min) {
      onChangeValue(value - step);
      setTempValue((value - step).toString());
    }
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 6 }}>
        {label}
      </Text>
      
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(28, 26, 26, 0.5)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.2)',
      }}>
        <Pressable
          onPress={handleDecrement}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRightWidth: 1,
            borderRightColor: 'rgba(243, 231, 211, 0.2)',
          }}
        >
          <Text style={{ color: '#C4A24C', fontSize: 20, fontWeight: 'bold' }}>-</Text>
        </Pressable>
        
        <TextInput
          value={tempValue}
          onChangeText={handleTextChange}
          onBlur={() => setTempValue(value.toString())}
          style={{
            flex: 1,
            color: '#F3E7D3',
            fontSize: 16,
            textAlign: 'center',
            paddingVertical: 12,
          }}
          keyboardType="numeric"
          selectTextOnFocus
        />
        
        <Pressable
          onPress={handleIncrement}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderLeftWidth: 1,
            borderLeftColor: 'rgba(243, 231, 211, 0.2)',
          }}
        >
          <Text style={{ color: '#C4A24C', fontSize: 20, fontWeight: 'bold' }}>+</Text>
        </Pressable>
      </View>

      {suffix && (
        <Text style={{
          position: 'absolute',
          right: 55,
          top: 34,
          color: 'rgba(243, 231, 211, 0.6)',
          fontSize: 12,
        }}>
          {suffix}
        </Text>
      )}
      
      {helperText && (
        <Text style={{
          color: 'rgba(243, 231, 211, 0.6)',
          fontSize: 12,
          marginTop: 4,
        }}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

// Toggle Button Group Component
interface ToggleButtonGroupProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: any) => void;
}

export function ToggleButtonGroup({ options, selectedValue, onSelect }: ToggleButtonGroupProps) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(28, 26, 26, 0.5)',
      borderRadius: 8,
      padding: 2,
    }}>
      {options.map((option, index) => (
        <Pressable
          key={option.value}
          onPress={() => onSelect(option.value)}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
            backgroundColor: selectedValue === option.value 
              ? getResultColor(option.value)
              : 'transparent',
            marginHorizontal: 1,
          }}
        >
          <Text style={{
            color: selectedValue === option.value ? '#1C1A1A' : '#F3E7D3',
            fontSize: 12,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function getResultColor(value: string): string {
  switch (value) {
    case 'win': return '#22C55E';
    case 'lose': return '#EF4444';
    case 'tie': return '#6B7280';
    default: return '#C4A24C';
  }
}

// Score Category Component
interface ScoreCategoryProps {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}

export function ScoreCategory({ title, description, icon, children }: ScoreCategoryProps) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <Text style={{ fontSize: 24, marginRight: 8 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: '#F3E7D3',
            fontSize: 18,
            fontWeight: 'bold',
          }}>
            {title}
          </Text>
          <Text style={{
            color: 'rgba(243, 231, 211, 0.7)',
            fontSize: 13,
          }}>
            {description}
          </Text>
        </View>
      </View>
      
      {children}
    </Card>
  );
}

// Toggle Row Component
interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

export function ToggleRow({ label, value, onToggle }: ToggleRowProps) {
  return (
    <Pressable
      onPress={() => onToggle(!value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(28, 26, 26, 0.3)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: value ? 'rgba(196, 162, 76, 0.3)' : 'rgba(243, 231, 211, 0.1)',
      }}
    >
      <Text style={{
        color: '#F3E7D3',
        fontSize: 14,
        flex: 1,
      }}>
        {label}
      </Text>
      
      <View style={{
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: value ? '#C4A24C' : 'rgba(107, 114, 128, 0.5)',
        alignItems: value ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 2,
      }}>
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
        }} />
      </View>
    </Pressable>
  );
}

// Score Summary Component
interface ScoreSummaryProps {
  playerScore: any; // Full player score object
  rank?: number;
  showBreakdown?: boolean;
}

export function ScoreSummary({ playerScore, rank, showBreakdown = false }: ScoreSummaryProps) {
  const [expanded, setExpanded] = useState(showBreakdown);

  return (
    <Card style={{
      borderWidth: rank === 1 ? 2 : 1,
      borderColor: rank === 1 ? '#FFD700' : 'rgba(243, 231, 211, 0.2)',
    }}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: expanded ? 16 : 0,
        }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {rank && (
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#6B7280',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{
                    color: rank <= 3 ? '#1C1A1A' : '#F3E7D3',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}>
                    {rank}
                  </Text>
                </View>
              )}
              
              <View>
                <Text style={{
                  color: '#F3E7D3',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                  {playerScore.playerName || `Player ${playerScore.playerId}`}
                </Text>
                <Text style={{
                  color: 'rgba(243, 231, 211, 0.7)',
                  fontSize: 13,
                }}>
                  Position {playerScore.position + 1}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{
              color: '#C4A24C',
              fontSize: 24,
              fontWeight: 'bold',
            }}>
              {playerScore.total}
            </Text>
            <Text style={{
              color: 'rgba(243, 231, 211, 0.6)',
              fontSize: 12,
            }}>
              points
            </Text>
          </View>
        </View>
      </Pressable>
      
      {expanded && (
        <View>
          <ScoreBreakdownRow icon="⚔️" label="Military" value={playerScore.military.total} />
          <ScoreBreakdownRow icon="💰" label="Treasury" value={playerScore.treasury} />
          <ScoreBreakdownRow icon="🏛️" label="Wonder" value={playerScore.wonder.total} />
          <ScoreBreakdownRow icon="🏘️" label="Civilian" value={playerScore.civilian} />
          <ScoreBreakdownRow icon="💼" label="Commercial" value={playerScore.commercial} />
          <ScoreBreakdownRow icon="🔬" label="Science" value={playerScore.science.total} />
          <ScoreBreakdownRow icon="🎭" label="Guilds" value={playerScore.guilds.total} />
          
          {playerScore.leaders !== undefined && (
            <ScoreBreakdownRow icon="👑" label="Leaders" value={playerScore.leaders} />
          )}
          {playerScore.cities && (
            <ScoreBreakdownRow icon="🏙️" label="Cities" value={playerScore.cities.total} />
          )}
          {playerScore.armada && (
            <ScoreBreakdownRow icon="⚓" label="Armada" value={playerScore.armada.total} />
          )}
          {playerScore.edifice && (
            <ScoreBreakdownRow icon="🗿" label="Edifice" value={playerScore.edifice.total} />
          )}
        </View>
      )}
    </Card>
  );
}

function ScoreBreakdownRow({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>{icon}</Text>
        <Text style={{ color: '#F3E7D3', fontSize: 14 }}>{label}</Text>
      </View>
      <Text style={{
        color: value >= 0 ? '#C4A24C' : '#EF4444',
        fontSize: 14,
        fontWeight: 'bold',
      }}>
        {value >= 0 ? '+' : ''}{value}
      </Text>
    </View>
  );
}

// Results Screen Component
interface ScoringResultsProps {
  playerScores: any[];
  gameSetup: any;
  onStartNewGame: () => void;
  onRecalculate: () => void;
}

export function ScoringResults({ playerScores, gameSetup, onStartNewGame, onRecalculate }: ScoringResultsProps) {
  const rankedScores = Enhanced7WondersScoringEngine.rankPlayers(playerScores);
  
  return (
    <View style={{ flex: 1 }}>
      <Text style={{
        color: '#F3E7D3',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
      }}>
        🏆 Final Results
      </Text>
      
      <Text style={{
        color: 'rgba(243, 231, 211, 0.7)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
      }}>
        7 Wonders Game Complete
      </Text>

      {rankedScores.map((score: PlayerScore, index: number) => (
        <ScoreSummary
          key={score.playerId}
          playerScore={score}
          rank={index + 1}
          showBreakdown={index === 0} // Expand winner by default
        />
      ))}

      <Card style={{ marginTop: 16 }}>
        <Text style={{
          color: '#F3E7D3',
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 8,
        }}>
          Game Summary
        </Text>
        
        <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 13, marginBottom: 4 }}>
          Players: {playerScores.length}
        </Text>
        
        <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 13, marginBottom: 4 }}>
          Expansions: {Object.entries(gameSetup.expansions)
            .filter(([_, enabled]) => enabled)
            .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
            .join(', ') || 'Base Game Only'}
        </Text>
        
        <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 13 }}>
          Winner: {rankedScores[0]?.playerName || 'Unknown'} with {rankedScores[0]?.total} points
        </Text>
      </Card>

      <View style={{
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
      }}>
        <Pressable
          onPress={onRecalculate}
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: 'rgba(19, 92, 102, 0.2)',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(243, 231, 211, 0.2)',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#F3E7D3', fontSize: 14, fontWeight: 'bold' }}>
            Recalculate Scores
          </Text>
        </Pressable>
        
        <Pressable
          onPress={onStartNewGame}
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: '#C4A24C',
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#1C1A1A', fontSize: 14, fontWeight: 'bold' }}>
            New Game
          </Text>
        </Pressable>
      </View>
    </View>
  );
}