// components/results/ResultsAnalysisSystem.tsx - Enhanced for React Native
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Trophy, 
  BarChart3, 
  Search, 
  Download, 
  RotateCcw, 
  Plus,
  Crown,
  Shield,
  Building,
  Coins,
  Beaker,
  Star
} from 'lucide-react-native';
import { Enhanced7WondersScoringEngine } from '../../lib/scoring/enhancedScoringEngine';

interface ResultsAnalysisProps {
  playerScores: any[];
  gameSetup: any;
  onStartNewGame: () => void;
  onRecalculate: () => void;
  onExportResults: (format: 'pdf' | 'png' | 'json') => void;
}

export function ResultsAnalysisSystem({
  playerScores,
  gameSetup,
  onStartNewGame,
  onRecalculate,
  onExportResults
}: ResultsAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'podium' | 'breakdown' | 'analysis' | 'export'>('podium');
  const rankedScores = Enhanced7WondersScoringEngine.rankPlayers(playerScores);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Trophy size={28} color="#FFD700" />
            <Text style={{
              color: '#FFD700',
              fontSize: 28,
              fontWeight: 'bold',
              marginLeft: 8,
            }}>
              7 Wonders Results
            </Text>
          </View>
          <Text style={{
            color: 'rgba(243, 231, 211, 0.8)',
            fontSize: 14,
            textAlign: 'center',
          }}>
            Game Complete • {playerScores.length} Players • {getExpansionsList(gameSetup.expansions)}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: 'rgba(28, 26, 26, 0.5)',
          borderRadius: 12,
          padding: 4,
          marginBottom: 20,
        }}>
          {[
            { key: 'podium', label: 'Podium', icon: Trophy },
            { key: 'breakdown', label: 'Breakdown', icon: BarChart3 },
            { key: 'analysis', label: 'Analysis', icon: Search },
            { key: 'export', label: 'Export', icon: Download },
          ].map(tab => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 8,
                borderRadius: 8,
                backgroundColor: activeTab === tab.key ? '#C4A24C' : 'transparent',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <tab.icon 
                size={16} 
                color={activeTab === tab.key ? '#1C1A1A' : '#F3E7D3'} 
              />
              <Text style={{
                color: activeTab === tab.key ? '#1C1A1A' : '#F3E7D3',
                fontSize: 12,
                fontWeight: 'bold',
              }}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {activeTab === 'podium' && (
            <WinnerPodium
              rankedScores={rankedScores}
              gameSetup={gameSetup}
            />
          )}
          
          {activeTab === 'breakdown' && (
            <ScoreBreakdownVisualization
              rankedScores={rankedScores}
            />
          )}
          
          {activeTab === 'analysis' && (
            <PlayerPerformanceAnalysis
              rankedScores={rankedScores}
              gameSetup={gameSetup}
            />
          )}
          
          {activeTab === 'export' && (
            <ExportOptions
              rankedScores={rankedScores}
              gameSetup={gameSetup}
              onExport={onExportResults}
            />
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={{
          flexDirection: 'row',
          gap: 12,
          marginTop: 16,
        }}>
          <Pressable
            onPress={onRecalculate}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: '#C4A24C',
              paddingVertical: 12,
              borderRadius: 8,
              gap: 8,
            }}
          >
            <RotateCcw size={16} color="#C4A24C" />
            <Text style={{ color: '#C4A24C', fontWeight: '600' }}>Recalculate</Text>
          </Pressable>
          
          <Pressable
            onPress={onStartNewGame}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#C4A24C',
              paddingVertical: 12,
              borderRadius: 8,
              gap: 8,
            }}
          >
            <Plus size={16} color="#1C1A1A" />
            <Text style={{ color: '#1C1A1A', fontWeight: '600' }}>New Game</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Winner Podium Component
function WinnerPodium({ rankedScores, gameSetup }: any) {
  const winner = rankedScores[0];
  const runnerUp = rankedScores[1];
  const third = rankedScores[2];

  return (
    <View style={{ gap: 20 }}>
      {/* Main Podium */}
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'flex-end', 
          justifyContent: 'center',
          height: 200,
          marginBottom: 20,
        }}>
          {/* Second Place */}
          {runnerUp && (
            <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#C0C0C0',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                borderWidth: 3,
                borderColor: '#A0A0A0',
              }}>
                <Text style={{ color: '#1C1A1A', fontSize: 20, fontWeight: 'bold' }}>2</Text>
              </View>
              <Text style={{ 
                color: '#F3E7D3', 
                fontSize: 14, 
                fontWeight: 'bold', 
                textAlign: 'center',
                marginBottom: 4
              }}>
                {runnerUp.playerName}
              </Text>
              <Text style={{ color: '#C0C0C0', fontSize: 16, fontWeight: 'bold' }}>
                {runnerUp.total}
              </Text>
              <View style={{
                width: 80,
                height: 120,
                backgroundColor: '#C0C0C0',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                marginTop: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: '#1C1A1A', fontSize: 12, fontWeight: 'bold' }}>2nd</Text>
              </View>
            </View>
          )}

          {/* First Place */}
          <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#FFD700',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              borderWidth: 4,
              borderColor: '#FFA500',
            }}>
              <Text style={{ color: '#1C1A1A', fontSize: 24, fontWeight: 'bold' }}>1</Text>
            </View>
            <Text style={{ 
              color: '#F3E7D3', 
              fontSize: 16, 
              fontWeight: 'bold', 
              textAlign: 'center',
              marginBottom: 4
            }}>
              {winner.playerName}
            </Text>
            <Text style={{ color: '#FFD700', fontSize: 20, fontWeight: 'bold' }}>
              {winner.total}
            </Text>
            <View style={{
              width: 100,
              height: 140,
              backgroundColor: '#FFD700',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              marginTop: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: '#1C1A1A', fontSize: 14, fontWeight: 'bold' }}>CHAMPION</Text>
            </View>
          </View>

          {/* Third Place */}
          {third && (
            <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#CD7F32',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                borderWidth: 3,
                borderColor: '#A0522D',
              }}>
                <Text style={{ color: '#1C1A1A', fontSize: 20, fontWeight: 'bold' }}>3</Text>
              </View>
              <Text style={{ 
                color: '#F3E7D3', 
                fontSize: 14, 
                fontWeight: 'bold', 
                textAlign: 'center',
                marginBottom: 4
              }}>
                {third.playerName}
              </Text>
              <Text style={{ color: '#CD7F32', fontSize: 16, fontWeight: 'bold' }}>
                {third.total}
              </Text>
              <View style={{
                width: 80,
                height: 100,
                backgroundColor: '#CD7F32',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                marginTop: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: '#1C1A1A', fontSize: 12, fontWeight: 'bold' }}>3rd</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Winner Details */}
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#FFD700', 
          textAlign: 'center',
          marginBottom: 16
        }}>
          Champion Details
        </Text>
        <WinnerAnalysis winner={winner} gameSetup={gameSetup} />
      </View>

      {/* Full Rankings */}
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#F3E7D3', 
          marginBottom: 16
        }}>
          Complete Rankings
        </Text>
        {rankedScores.map((score: any, index: number) => (
          <RankingRow
            key={score.playerId}
            score={score}
            rank={index + 1}
            isWinner={index === 0}
          />
        ))}
      </View>
    </View>
  );
}

// Score Breakdown Visualization
function ScoreBreakdownVisualization({ rankedScores }: any) {
  const [selectedPlayer, setSelectedPlayer] = useState(rankedScores[0]);

  return (
    <View style={{ gap: 20 }}>
      {/* Player Selector */}
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#F3E7D3', 
          marginBottom: 16
        }}>
          Player Score Analysis
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {rankedScores.map((score: any) => (
              <Pressable
                key={score.playerId}
                onPress={() => setSelectedPlayer(score)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: selectedPlayer.playerId === score.playerId ? '#C4A24C' : 'rgba(243, 231, 211, 0.1)',
                  borderWidth: 1,
                  borderColor: selectedPlayer.playerId === score.playerId ? '#C4A24C' : 'rgba(243, 231, 211, 0.2)',
                }}
              >
                <Text style={{
                  color: selectedPlayer.playerId === score.playerId ? '#1C1A1A' : '#F3E7D3',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                  {score.playerName} ({score.total})
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Selected Player Breakdown */}
      <DetailedScoreBreakdown player={selectedPlayer} />

      {/* Category Comparison Chart */}
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#F3E7D3', 
          marginBottom: 16
        }}>
          Category Comparison
        </Text>
        <CategoryComparisonChart rankedScores={rankedScores} />
      </View>
    </View>
  );
}

// Player Performance Analysis
function PlayerPerformanceAnalysis({ rankedScores, gameSetup }: any) {
  return (
    <View style={{ gap: 20 }}>
      {/* Game Statistics */}
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#F3E7D3', 
          marginBottom: 16
        }}>
          Game Statistics
        </Text>
        <GameStatistics rankedScores={rankedScores} gameSetup={gameSetup} />
      </View>

      {/* Strategy Analysis */}
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#F3E7D3', 
          marginBottom: 16
        }}>
          Strategy Analysis
        </Text>
        <StrategyAnalysis rankedScores={rankedScores} />
      </View>

      {/* Performance Insights */}
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#F3E7D3', 
          marginBottom: 16
        }}>
          Performance Insights
        </Text>
        <PerformanceInsights rankedScores={rankedScores} />
      </View>

      {/* Expansion Impact */}
      {Object.values(gameSetup.expansions).some(Boolean) && (
        <View style={{
          backgroundColor: 'rgba(19, 92, 102, 0.2)',
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: 'rgba(243, 231, 211, 0.1)',
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#F3E7D3', 
            marginBottom: 16
          }}>
            Expansion Impact
          </Text>
          <ExpansionImpactAnalysis rankedScores={rankedScores} gameSetup={gameSetup} />
        </View>
      )}
    </View>
  );
}

// Export Options
function ExportOptions({ rankedScores, gameSetup, onExport }: any) {
  const handleExport = (format: 'pdf' | 'png' | 'json') => {
    Alert.alert(
      'Export Results',
      `Export game results as ${format.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => onExport(format) },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `7 Wonders Game Results\nWinner: ${rankedScores[0].playerName} with ${rankedScores[0].total} points!`,
        title: '7 Wonders Results',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={{ gap: 20 }}>
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#F3E7D3', 
          marginBottom: 8
        }}>
          Export Game Results
        </Text>
        <Text style={{ 
          color: 'rgba(243, 231, 211, 0.7)', 
          marginBottom: 16,
          fontSize: 14
        }}>
          Share your 7 Wonders game results in various formats
        </Text>

        <View style={{ gap: 12 }}>
          <ExportOption
            title="PDF Report"
            description="Complete game analysis with charts and breakdowns"
            icon={<Download size={20} color="#F3E7D3" />}
            onPress={() => handleExport('pdf')}
          />
          
          <ExportOption
            title="PNG Image"
            description="Visual summary perfect for sharing on social media"
            icon={<Download size={20} color="#F3E7D3" />}
            onPress={() => handleExport('png')}
          />
          
          <ExportOption
            title="JSON Data"
            description="Raw data for analysis in other tools"
            icon={<Download size={20} color="#F3E7D3" />}
            onPress={() => handleExport('json')}
          />

          <ExportOption
            title="Share Results"
            description="Share game summary via messaging apps"
            icon={<Download size={20} color="#F3E7D3" />}
            onPress={handleShare}
          />
        </View>
      </View>

      {/* Game Summary for Export */}
      <View style={{
        backgroundColor: 'rgba(19, 92, 102, 0.2)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.1)',
      }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: '#F3E7D3', 
          marginBottom: 16
        }}>
          Export Preview
        </Text>
        <ExportPreview rankedScores={rankedScores} gameSetup={gameSetup} />
      </View>
    </View>
  );
}

// Helper Components (all the supporting components with React Native styling)
function WinnerAnalysis({ winner, gameSetup }: any) {
  const getWinningStrategy = (score: any) => {
    const categories = [
      { name: 'Science', value: score.science?.total || 0, icon: Beaker },
      { name: 'Military', value: score.military?.total || 0, icon: Shield },
      { name: 'Civilian', value: score.civilian || 0, icon: Building },
      { name: 'Wonder', value: score.wonder?.total || 0, icon: Crown },
      { name: 'Guilds', value: score.guilds?.total || 0, icon: Star },
    ];
    
    const topCategory = categories.reduce((prev, current) => 
      current.value > prev.value ? current : prev
    );
    
    return topCategory;
  };

  const strategy = getWinningStrategy(winner);

  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: '#FFD700', fontSize: 18, fontWeight: 'bold' }}>
          {winner.playerName}
        </Text>
        <Text style={{ color: '#F3E7D3', fontSize: 32, fontWeight: 'bold' }}>
          {winner.total} points
        </Text>
      </View>

      <View style={{
        padding: 12,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 8,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}>
        <strategy.icon size={20} color="#FFD700" />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold' }}>
            Winning Strategy: {strategy.name}
          </Text>
          <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 13 }}>
            Dominated with {strategy.value} points from {strategy.name.toLowerCase()}
          </Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <ScoreBreakdownRow icon={<Beaker size={16} color="#10B981" />} label="Science" value={winner.science?.total || 0} />
        <ScoreBreakdownRow icon={<Shield size={16} color="#EF4444" />} label="Military" value={winner.military?.total || 0} />
        <ScoreBreakdownRow icon={<Building size={16} color="#3B82F6" />} label="Civilian" value={winner.civilian || 0} />
        <ScoreBreakdownRow icon={<Crown size={16} color="#F59E0B" />} label="Wonder" value={winner.wonder?.total || 0} />
        <ScoreBreakdownRow icon={<Coins size={16} color="#F59E0B" />} label="Treasury" value={winner.treasury || 0} />
        <ScoreBreakdownRow icon={<Star size={16} color="#8B5CF6" />} label="Guilds" value={winner.guilds?.total || 0} />
      </View>
    </View>
  );
}

function RankingRow({ score, rank, isWinner }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable onPress={() => setExpanded(!expanded)}>
      <View style={{
        padding: 12,
        backgroundColor: isWinner ? 'rgba(255, 215, 0, 0.1)' : 'rgba(19, 92, 102, 0.1)',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: isWinner ? 2 : 1,
        borderColor: isWinner ? '#FFD700' : 'rgba(243, 231, 211, 0.2)',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
            
            <View style={{ flex: 1 }}>
              <Text style={{
                color: '#F3E7D3',
                fontSize: 16,
                fontWeight: 'bold',
              }}>
                {score.playerName}
              </Text>
              <Text style={{
                color: 'rgba(243, 231, 211, 0.7)',
                fontSize: 12,
              }}>
                Position {score.position + 1}
              </Text>
            </View>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{
              color: '#C4A24C',
              fontSize: 20,
              fontWeight: 'bold',
            }}>
              {score.total}
            </Text>
            <Text style={{
              color: 'rgba(243, 231, 211, 0.6)',
              fontSize: 10,
            }}>
              points
            </Text>
          </View>
        </View>
        
        {expanded && (
          <View style={{ 
            marginTop: 12, 
            paddingTop: 12, 
            borderTopWidth: 1, 
            borderTopColor: 'rgba(243, 231, 211, 0.2)' 
          }}>
            <View style={{ gap: 4 }}>
              <ScoreBreakdownRow icon={<Shield size={14} color="#EF4444" />} label="Military" value={score.military?.total || 0} />
              <ScoreBreakdownRow icon={<Coins size={14} color="#F59E0B" />} label="Treasury" value={score.treasury || 0} />
              <ScoreBreakdownRow icon={<Crown size={14} color="#F59E0B" />} label="Wonder" value={score.wonder?.total || 0} />
              <ScoreBreakdownRow icon={<Building size={14} color="#3B82F6" />} label="Civilian" value={score.civilian || 0} />
              <ScoreBreakdownRow icon={<Coins size={14} color="#F59E0B" />} label="Commercial" value={score.commercial || 0} />
              <ScoreBreakdownRow icon={<Beaker size={14} color="#10B981" />} label="Science" value={score.science?.total || 0} />
              <ScoreBreakdownRow icon={<Star size={14} color="#8B5CF6" />} label="Guilds" value={score.guilds?.total || 0} />
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function DetailedScoreBreakdown({ player }: any) {
  return (
    <View style={{
      backgroundColor: 'rgba(19, 92, 102, 0.2)',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(243, 231, 211, 0.1)',
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F3E7D3',
        marginBottom: 16
      }}>
        {`${player.playerName}'s Score Breakdown`}
      </Text>
      
      <View style={{ gap: 12 }}>
        <ScoreCategoryDetail
          icon={<Shield size={16} color="#EF4444" />}
          title="Military"
          points={player.military?.total || 0}
          details={`Victories: ${(player.military?.victoryTokens?.age1 || 0) + (player.military?.victoryTokens?.age2 || 0) + (player.military?.victoryTokens?.age3 || 0)}, Defeats: ${player.military?.defeatTokens || 0}`}
        />
        
        <ScoreCategoryDetail
          icon={<Beaker size={16} color="#10B981" />}
          title="Science"
          points={player.science?.total || 0}
          details={player.science?.breakdown || 'Science calculation details'}
        />
        
        <ScoreCategoryDetail
          icon={<Crown size={16} color="#F59E0B" />}
          title="Wonder"
          points={player.wonder?.total || 0}
          details={`${player.wonder?.stagesBuilt?.length || 0} stages built`}
        />
        
        <ScoreCategoryDetail
          icon={<Star size={16} color="#8B5CF6" />}
          title="Guilds"
          points={player.guilds?.total || 0}
          details={player.guilds?.breakdown || 'Guild calculation details'}
        />
      </View>
    </View>
  );
}

function ScoreCategoryDetail({ icon, title, points, details }: any) {
  return (
    <View style={{
      padding: 12,
      backgroundColor: 'rgba(19, 92, 102, 0.1)',
      borderRadius: 8,
    }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 4 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={{ color: '#F3E7D3', fontSize: 14, fontWeight: 'bold' }}>
            {title}
          </Text>
        </View>
        <Text style={{ color: '#C4A24C', fontSize: 16, fontWeight: 'bold' }}>
          {points}
        </Text>
      </View>
      <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12 }}>
        {details}
      </Text>
    </View>
  );
}

function CategoryComparisonChart({ rankedScores }: any) {
  const categories = ['military', 'science', 'civilian', 'wonder', 'treasury', 'guilds'];
  
  return (
    <View>
      {categories.map(category => (
        <CategoryBar
          key={category}
          category={category}
          scores={rankedScores}
        />
      ))}
    </View>
  );
}

function CategoryBar({ category, scores }: any) {
  const maxValue = Math.max(...scores.map((s: any) => s[category]?.total || s[category] || 0));
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#F3E7D3', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
        {categoryName}
      </Text>
      
      {scores.map((score: any, index: number) => {
        const value = score[category]?.total || score[category] || 0;
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return (
          <View key={score.playerId} style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ color: '#F3E7D3', fontSize: 12, width: 100 }}>
                {score.playerName}
              </Text>
              <Text style={{ color: '#C4A24C', fontSize: 12, marginLeft: 'auto' }}>
                {value}
              </Text>
            </View>
            <View style={{
              height: 6,
              backgroundColor: 'rgba(243, 231, 211, 0.2)',
              borderRadius: 3,
            }}>
              <View style={{
                height: 6,
                backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#6B7280',
                borderRadius: 3,
                width: `${percentage}%`,
              }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function GameStatistics({ rankedScores, gameSetup }: any) {
  const stats = calculateGameStatistics(rankedScores);
  
  return (
    <View style={{ gap: 12 }}>
      <StatRow label="Average Score" value={stats.averageScore.toFixed(1)} />
      <StatRow label="Score Range" value={`${stats.minScore} - ${stats.maxScore}`} />
      <StatRow label="Margin of Victory" value={stats.marginOfVictory.toString()} />
      <StatRow label="Highest Science" value={stats.highestScience.toString()} />
      <StatRow label="Most Military Victories" value={stats.mostMilitary.toString()} />
    </View>
  );
}

function StrategyAnalysis({ rankedScores }: any) {
  const strategies = analyzeStrategies(rankedScores);
  
  return (
    <View style={{ gap: 8 }}>
      {strategies.map((strategy: any, index: number) => (
        <View key={index} style={{
          padding: 12,
          backgroundColor: 'rgba(19, 92, 102, 0.1)',
          borderRadius: 8,
        }}>
          <Text style={{ color: '#F3E7D3', fontSize: 14, fontWeight: 'bold' }}>
            {strategy.type}
          </Text>
          <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 12 }}>
            {strategy.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

function PerformanceInsights({ rankedScores }: any) {
  const insights = generateInsights(rankedScores);
  
  return (
    <View style={{ gap: 8 }}>
      {insights.map((insight: any, index: number) => (
        <View key={index} style={{
          padding: 12,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderRadius: 8,
        }}>
          <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: 'bold' }}>
            💡 {insight.title}
          </Text>
          <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 12 }}>
            {insight.message}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ExpansionImpactAnalysis({ rankedScores, gameSetup }: any) {
  return (
    <View>
      <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>
        Active Expansions Impact:
      </Text>
      
      {Object.entries(gameSetup.expansions)
        .filter(([_, enabled]) => enabled)
        .map(([expansion]) => (
          <View key={expansion} style={{
            padding: 8,
            backgroundColor: 'rgba(147, 112, 219, 0.1)',
            borderRadius: 6,
            marginBottom: 4,
          }}>
            <Text style={{ color: '#9370DB', fontSize: 13, fontWeight: 'bold' }}>
              {expansion.charAt(0).toUpperCase() + expansion.slice(1)}
            </Text>
            <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 11 }}>
              {getExpansionImpact(expansion, rankedScores)}
            </Text>
          </View>
        ))}
    </View>
  );
}

function ExportOption({ title, description, icon, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(19, 92, 102, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(243, 231, 211, 0.2)',
        gap: 12,
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
          {title}
        </Text>
        <Text style={{ color: 'rgba(243, 231, 211, 0.7)', fontSize: 13 }}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function ExportPreview({ rankedScores, gameSetup }: any) {
  return (
    <View>
      <Text style={{ color: '#F3E7D3', fontSize: 14, marginBottom: 8 }}>
        Export will include:
      </Text>
      
      <View style={{ gap: 4 }}>
        <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 12 }}>
          • Complete player rankings and scores
        </Text>
        <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 12 }}>
          • Detailed score breakdowns by category
        </Text>
        <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 12 }}>
          • Game configuration and expansion details
        </Text>
        <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 12 }}>
          • Performance analysis and insights
        </Text>
        <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 12 }}>
          • Winner podium and statistics
        </Text>
      </View>
    </View>
  );
}

function ScoreBreakdownRow({ icon, label, value }: any) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 2,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text style={{ color: '#F3E7D3', fontSize: 13 }}>{label}</Text>
      </View>
      <Text style={{
        color: value >= 0 ? '#C4A24C' : '#EF4444',
        fontSize: 13,
        fontWeight: 'bold',
      }}>
        {value >= 0 ? '+' : ''}{value}
      </Text>
    </View>
  );
}

function StatRow({ label, value }: any) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    }}>
      <Text style={{ color: '#F3E7D3', fontSize: 13 }}>{label}</Text>
      <Text style={{ color: '#C4A24C', fontSize: 13, fontWeight: 'bold' }}>{value}</Text>
    </View>
  );
}

// Helper Functions

function getExpansionsList(expansions: any): string {
  const active = Object.entries(expansions)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
  return active.length > 0 ? active.join(' + ') : 'Base Game';
}

function calculateGameStatistics(scores: any[]) {
  const totals = scores.map(s => s.total);
  const sciences = scores.map(s => s.science?.total || 0);
  const militaries = scores.map(s => s.military?.total || 0);
  
  return {
    averageScore: totals.reduce((a, b) => a + b, 0) / totals.length,
    minScore: Math.min(...totals),
    maxScore: Math.max(...totals),
    marginOfVictory: totals[0] - totals[1],
    highestScience: Math.max(...sciences),
    mostMilitary: Math.max(...militaries),
  };
}

function analyzeStrategies(scores: any[]) {
  return [
    { type: 'Science Strategy', description: 'Focus on green cards and science symbols' },
    { type: 'Military Strategy', description: 'Aggressive military expansion' },
    { type: 'Civic Strategy', description: 'Building civilian structures for steady points' },
  ];
}

function generateInsights(scores: any[]) {
  return [
    { title: 'Science Dominance', message: 'Science strategies performed well this game' },
    { title: 'Military Balance', message: 'Military conflicts were evenly distributed' },
    { title: 'Wonder Impact', message: 'Wonder stages provided significant advantages' },
  ];
}

function getExpansionImpact(expansion: string, scores: any[]): string {
  switch (expansion) {
    case 'leaders':
      return 'Added strategic depth with early game abilities';
    case 'cities':
      return 'Diplomacy tokens changed military dynamics';
    case 'armada':
      return 'Naval conflicts provided alternative victory paths';
    case 'edifice':
      return 'Collaborative projects encouraged cooperation';
    default:
      return 'Enhanced gameplay experience';
  }
}