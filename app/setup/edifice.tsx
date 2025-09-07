// app/setup/edifice.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card, H1, H2, P, Screen } from '../../components/ui';
import { EdificeProjectDetail } from '../../components/ui/edifice-card';
import { EdificeProjectSelector, EdificeSelectionSummary } from '../../components/ui/edifice-selection';
import {
  EdificeProject,
  getRandomProjects
} from '../../data/edificeDatabase';
import { useSetupStore } from '../../store/setupStore';

export default function EdificeSelectionScreen() {
  const { players, edificeProjects, setEdificeProjects, expansions } = useSetupStore();
  const [selectedProjects, setSelectedProjects] = useState(edificeProjects);
  const [selectionMode, setSelectionMode] = useState<'manual' | 'random'>('manual');
  const [detailProject, setDetailProject] = useState<EdificeProject | null>(null);
  const [currentAge, setCurrentAge] = useState<1 | 2 | 3>(1);

  // Add navigation guard at the start
  useEffect(() => {
    // Redirect if Edifice expansion isn't enabled -> go to Game Summary
    if (!expansions.edifice) {
      router.replace('/setup/game-summary');
    }
  }, [expansions.edifice]);

  const handleProjectSelect = (age: 1 | 2 | 3, projectId: string) => {
    setSelectedProjects(prev => ({
      ...prev,
      [`age${age}`]: projectId
    }));
  };

  const handleRandomSelection = () => {
    Alert.alert(
      'Random Project Selection',
      'This will randomly select one project from each age. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Random Select', 
          onPress: () => {
            const randomProjects = getRandomProjects();
            setSelectedProjects(randomProjects);
          }
        },
      ]
    );
  };

  const handleClearSelection = () => {
    Alert.alert(
      'Clear All Projects',
      'This will remove all project selections. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setSelectedProjects({});
          }
        },
      ]
    );
  };

  const handleContinue = () => {
    // Save edifice selections first
    setEdificeProjects(selectedProjects);
    // Always go to game summary before scoring
    router.push('/setup/game-summary');
  };

  const isComplete =
    selectedProjects.age1 && selectedProjects.age2 && selectedProjects.age3;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <H1>🏗️ Edifice Projects</H1>
        <P className="mb-4">
          Select one project from each age. These will be available for all players to build during the game.
        </P>

        {/* Game Setup Info */}
        <Card>
          <H2>Project Selection</H2>
          <P className="text-parchment/60 text-sm mb-3">
            {players.length} players • Edifice expansion enabled
          </P>
          <P className="text-parchment/70 text-sm">
            Choose 3 projects total: one from each age. All players will have access to these projects during the corresponding ages.
          </P>
        </Card>

        {/* Selection Mode & Controls */}
        <Card>
          <H2>Selection Mode</H2>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <View style={{ flex: 1, minWidth: '48%' }}>
              <Button
                title="📋 Manual Selection"
                variant={selectionMode === 'manual' ? 'primary' : 'ghost'}
                onPress={() => setSelectionMode('manual')}
                className="w-full"
              />
            </View>
            <View style={{ flex: 1, minWidth: '48%' }}>
              <Button
                title="🎲 Random Selection"
                variant={selectionMode === 'random' ? 'primary' : 'ghost'}
                onPress={() => setSelectionMode('random')}
                className="w-full"
              />
            </View>
          </View>

          {selectionMode === 'random' && (
            <View style={{ gap: 8 }}>
              <Button
                title="🎲 Generate Random Projects"
                onPress={handleRandomSelection}
                variant="ghost"
              />
              <P className="text-parchment/70 text-sm text-center">
                Randomly selects balanced projects for varied gameplay
              </P>
            </View>
          )}
        </Card>

        {/* Current Selection Summary */}
        {isComplete && (
          <EdificeSelectionSummary
            selectedProjects={selectedProjects}
            onProjectDetail={setDetailProject}
          />
        )}

        {/* Manual Selection Interface */}
        {selectionMode === 'manual' && (
          <>
            {/* Age Selection Tabs */}
            <Card>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {[1, 2, 3].map((age) => (
                  <View key={age} style={{ minWidth: 96 }}>
                    <Button
                      title={`Age ${['I', 'II', 'III'][age - 1]}`}
                      variant={currentAge === age ? 'primary' : 'ghost'}
                      onPress={() => setCurrentAge(age as 1 | 2 | 3)}
                      className="w-full"
                    />
                  </View>
                ))}
              </View>

              <EdificeProjectSelector
                age={currentAge}
                selectedProjectId={selectedProjects[`age${currentAge}` as keyof typeof selectedProjects]}
                onProjectSelect={(projectId: string) => handleProjectSelect(currentAge, projectId)}
                onProjectDetail={setDetailProject}
              />
            </Card>
          </>
        )}

        {/* Project Detail Modal */}
        {detailProject && (
          <EdificeProjectDetail
            project={detailProject}
            onClose={() => setDetailProject(null)}
          />
        )}

        {/* Navigation */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: 14,
              minHeight: 48,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(196,162,76,0.4)',
              backgroundColor: pressed ? 'rgba(243,231,211,0.06)' : 'transparent',
            })}
          >
            <Text style={{ color: '#C4A24C', fontWeight: '700', textAlign: 'center' }}>
              Back to Wonders
            </Text>
          </Pressable>
          <Pressable
            onPress={handleContinue}
            disabled={!isComplete}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: 14,
              minHeight: 48,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? 'rgba(196,162,76,0.8)' : '#C4A24C',
              opacity: !isComplete ? 0.5 : 1,
            })}
          >
            <Text style={{ color: '#1C1A1A', fontWeight: '800', textAlign: 'center' }}>
              Continue to Summary
            </Text>
          </Pressable>
        </View>

        {/* Bottom padding */}
        <Card className="opacity-0 h-4" />
      </ScrollView>
    </Screen>
  );
}