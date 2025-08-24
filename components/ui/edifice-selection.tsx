// components/ui/edifice-selection.tsx
import React from 'react';
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { EdificeProjectCard } from './edifice-card';
import { 
  getProjectsByAge, 
  getProjectById,
  EdificeProject 
} from '../../data/edificeDatabase';

interface EdificeProjectSelectorProps {
  age: 1 | 2 | 3;
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  onProjectDetail: (project: EdificeProject) => void;
}

export function EdificeProjectSelector({
  age,
  selectedProjectId,
  onProjectSelect,
  onProjectDetail,
}: EdificeProjectSelectorProps) {
  const projects = getProjectsByAge(age);

  const getAgeDescription = (age: number) => {
    switch (age) {
      case 1: return 'Foundation projects focusing on basic infrastructure and early advantages';
      case 2: return 'Development projects providing intermediate benefits and strategic options';
      case 3: return 'Pinnacle projects offering powerful endgame effects and victory conditions';
      default: return '';
    }
  };

  const getAgeColor = (age: number) => {
    switch (age) {
      case 1: return '#8B4513'; // Brown
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#FFD700'; // Gold
      default: return '#8B4513';
    }
  };

  return (
    <View>
      {/* Age Header */}
      <View style={{
        backgroundColor: getAgeColor(age),
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',
      }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
          Age {age} Projects
        </Text>
        <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 12, textAlign: 'center' }}>
          {getAgeDescription(age)}
        </Text>
      </View>

      {/* Selection Status */}
      <View style={{
        backgroundColor: selectedProjectId ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: selectedProjectId ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      }}>
        <Text style={{
          color: selectedProjectId ? '#22C55E' : '#EF4444',
          fontSize: 14,
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          {selectedProjectId ? 
            `Selected: ${getProjectById(selectedProjectId)?.name}` : 
            `No Age ${age} project selected`
          }
        </Text>
      </View>

      {/* Project Grid */}
      <Text style={{
        color: 'rgba(243, 231, 211, 0.8)',
        fontSize: 13,
        marginBottom: 8,
      }}>
        Available Projects ({projects.length}):
      </Text>

      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 8,
      }}>
        {projects.map((project) => (
          <View key={project.id} style={{ marginBottom: 8 }}>
            <EdificeProjectCard
              project={project}
              isSelected={selectedProjectId === project.id}
              onSelect={() => onProjectSelect(project.id)}
            />
            
            {/* Detail Button */}
            <Pressable
              onPress={() => onProjectDetail(project)}
              style={{
                backgroundColor: 'rgba(196, 162, 76, 0.2)',
                borderRadius: 6,
                paddingVertical: 4,
                paddingHorizontal: 8,
                marginTop: 4,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(196, 162, 76, 0.4)',
              }}
            >
              <Text style={{ color: '#C4A24C', fontSize: 10, fontWeight: 'bold' }}>
                📖 Details
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* Strategy Tips */}
      <View style={{
        backgroundColor: 'rgba(196, 162, 76, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#C4A24C',
      }}>
        <Text style={{ color: '#C4A24C', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
          💡 Age {age} Strategy Tips:
        </Text>
        <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 11, lineHeight: 16 }}>
          {getStrategyTip(age)}
        </Text>
      </View>
    </View>
  );
}

function getStrategyTip(age: number): string {
  switch (age) {
    case 1:
      return 'Early projects should complement your wonder and provide immediate benefits. Consider projects that synergize with your starting resource or help with future building costs.';
    case 2:
      return 'Mid-game projects can provide significant point swings. Look for projects that reward what you\'re already building or help catch up in areas you\'re behind.';
    case 3:
      return 'Late-game projects offer the highest rewards but often require substantial investment. Choose projects that align with your victory strategy and current board state.';
    default:
      return '';
  }
}

interface EdificeSelectionSummaryProps {
  selectedProjects: Record<string, string>;
  onProjectDetail: (project: EdificeProject) => void;
}

export function EdificeSelectionSummary({
  selectedProjects,
  onProjectDetail,
}: EdificeSelectionSummaryProps) {
  const { age1, age2, age3 } = selectedProjects;

  const getProjectSummary = (projectId: string | undefined, age: number) => {
    if (!projectId) return null;
    const project = getProjectById(projectId);
    if (!project) return null;

    return (
      <Pressable
        onPress={() => onProjectDetail(project)}
        style={{
          backgroundColor: 'rgba(19, 92, 102, 0.3)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: 'rgba(243, 231, 211, 0.2)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <View style={{
            backgroundColor: getAgeColor(age),
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginRight: 8,
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              AGE {age}
            </Text>
          </View>
          <Text style={{ color: '#F3E7D3', fontSize: 14, fontWeight: 'bold', flex: 1 }}>
            {project.name}
          </Text>
        </View>

        <Text style={{
          color: 'rgba(243, 231, 211, 0.7)',
          fontSize: 11,
          marginBottom: 4,
        }}>
          {project.effect.description}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{
            backgroundColor: getStrategyColor(project.strategicValue),
            borderRadius: 4,
            paddingHorizontal: 4,
            paddingVertical: 1,
          }}>
            <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
              {project.strategicValue}
            </Text>
          </View>
          
          <Text style={{ color: '#C4A24C', fontSize: 10, fontWeight: 'bold' }}>
            {project.effect.pointsFormula || `${project.points} pts`}
          </Text>
        </View>
      </Pressable>
    );
  };

  const getAgeColor = (age: number) => {
    switch (age) {
      case 1: return '#8B4513';
      case 2: return '#C0C0C0';
      case 3: return '#FFD700';
      default: return '#8B4513';
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'Economic': return '#22C55E';
      case 'Military': return '#EF4444';
      case 'Science': return '#3B82F6';
      case 'Balanced': return '#8B5CF6';
      case 'Situational': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <View style={{
      backgroundColor: 'rgba(19, 92, 102, 0.2)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(243, 231, 211, 0.1)',
    }}>
      <Text style={{ color: '#F3E7D3', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
        🏗️ Selected Projects
      </Text>

      <View style={{
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.4)',
      }}>
        <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>
          ✓ All 3 projects selected - Ready to continue!
        </Text>
      </View>

      {getProjectSummary(age1, 1)}
      {getProjectSummary(age2, 2)}
      {getProjectSummary(age3, 3)}

      <View style={{
        backgroundColor: 'rgba(196, 162, 76, 0.1)',
        borderRadius: 8,
        padding: 8,
        marginTop: 8,
      }}>
        <Text style={{ color: '#C4A24C', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
          📋 Game Setup:
        </Text>
        <Text style={{ color: 'rgba(243, 231, 211, 0.8)', fontSize: 11 }}>
          These projects will be available to all players during their respective ages. 
          Players can build them using the standard construction rules.
        </Text>
      </View>
    </View>
  );
}