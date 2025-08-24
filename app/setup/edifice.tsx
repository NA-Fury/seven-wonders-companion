// app/setup/edifice.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
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
    // Redirect if Edifice expansion isn't enabled
    if (!expansions.edifice) {
      router.replace('/setup/scoring-mode');
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
    router.push('/setup/scoring-mode');
  };

  // Update the back navigation to be more robust
  const handleBack = () => {
    if (expansions.armada) {
      // Go back to wonder selection to show shipyards
      router.push('/setup/wonders');
    } else {
      router.back();
    }
  };  

  const isComplete = selectedProjects.age1 && selectedProjects.age2 && selectedProjects.age3;

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
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <Button
              title="📋 Manual Selection"
              variant={selectionMode === 'manual' ? 'primary' : 'ghost'}
              onPress={() => setSelectionMode('manual')}
              className="flex-1 mr-2"
            />
            <Button
              title="🎲 Random Selection"
              variant={selectionMode === 'random' ? 'primary' : 'ghost'}
              onPress={() => setSelectionMode('random')}
              className="flex-1 ml-2"
            />
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

          {Object.keys(selectedProjects).length > 0 && (
            <Button
              title="🗑️ Clear All Selections"
              onPress={handleClearSelection}
              variant="ghost"
              className="mt-2"
            />
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
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                {[1, 2, 3].map((age) => (
                  <Button
                    key={age}
                    title={`Age ${age}`}
                    variant={currentAge === age ? 'primary' : 'ghost'}
                    onPress={() => setCurrentAge(age as 1 | 2 | 3)}
                    className="flex-1 mx-1"
                  />
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
        <Card className="flex-row gap-3 mt-4">
          <Button
            title="Back to Wonders"
            variant="ghost"
            onPress={() => router.back()}
            className="flex-1"
          />
          <Button
            title="Continue to Summary"
            onPress={handleContinue}
            className="flex-1"
            disabled={!isComplete}
          />
        </Card>

        {/* Bottom padding */}
        <Card className="opacity-0 h-4" />
      </ScrollView>
    </Screen>
  );
}