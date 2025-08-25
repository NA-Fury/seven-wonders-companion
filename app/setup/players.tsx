// app/setup/players.tsx - Fixed version with proper scrolling and safe areas
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, H1, H2, P } from '../../components/ui'; // removed unused Screen
import { AnimatedButton, PlayerListItem } from '../../components/ui/enhanced';
import { useSetupStore } from '../../store/setupStore';

export default function PlayersScreen() {
  const { players, addPlayer, removePlayer, expansions } = useSetupStore();
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      if (players.some(p => p.name.toLowerCase() === newPlayerName.trim().toLowerCase())) {
        Alert.alert('Duplicate Name', 'A player with this name already exists.');
        return;
      }
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const handleRemovePlayer = (id: string) => {
    Alert.alert(
      'Remove Player',
      'Are you sure you want to remove this player?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removePlayer(id) },
      ]
    );
  };

  const handleStartGame = () => {
    if (players.length < 3) {
      Alert.alert('Not Enough Players', 'You need at least 3 players to start a game.');
      return;
    }
    if (players.length > 7) {
      Alert.alert('Too Many Players', '7 Wonders supports a maximum of 7 players.');
      return;
    }
    router.push('/setup/seating');
  };

  const getExpansionText = () => {
    const active = Object.entries(expansions)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));

    return active.length > 0 ? `Base + ${active.join(' + ')}` : 'Base Game Only';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: '#1C1A1A', 
          paddingHorizontal: 20,
          paddingTop: 10
        }}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingBottom: 120, // Extra space for navigation buttons
              flexGrow: 1 
            }}
            style={{ flex: 1 }}
          >
            <H1>Players</H1>
            {/* className -> style */}
            <P style={{ marginBottom: 16 }}>Add 3-7 players for your game.</P>
            
            <Card>
              <H2>Game Setup</H2>
              {/* className -> style (text-aurum) */}
              <P style={{ color: '#C4A24C' }}>
                {getExpansionText()}
              </P>
              {/* className -> style (text-parchment/60 text-sm mt-1) */}
              <P style={{ color: 'rgba(243, 231, 211, 0.6)', fontSize: 14, marginTop: 4 }}>
                {players.length}/7 players added
              </P>
            </Card>

            <Card>
              <H2>Add New Player</H2>
              <TextInput
                value={newPlayerName}
                onChangeText={setNewPlayerName}
                placeholder="Enter player name"
                placeholderTextColor="#F3E7D380"
                style={{
                  backgroundColor: 'rgba(28, 26, 26, 0.5)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: '#F3E7D3',
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(243, 231, 211, 0.2)',
                  marginBottom: 12,
                }}
                onSubmitEditing={handleAddPlayer}
                maxLength={20}
                returnKeyType="done"
              />
              <AnimatedButton
                title="Add Player"
                onPress={handleAddPlayer}
                disabled={!newPlayerName.trim() || players.length >= 7}
              />
            </Card>

            {players.length > 0 && (
              <Card>
                <H2>Current Players ({players.length})</H2>
                <View style={{ maxHeight: 300 }}>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    {players.map((player) => (
                      <PlayerListItem
                        key={player.id}
                        player={player}
                        // pass the correctly typed handler (id => void)
                        onRemove={handleRemovePlayer}
                        // className -> style
                        style={{ marginBottom: 8 }}
                      />
                    ))}
                  </ScrollView>
                </View>
              </Card>
            )}

            {/* Add some space before navigation */}
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Fixed Navigation at Bottom */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#1C1A1A',
            paddingHorizontal: 20,
            paddingVertical: 16,
            paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Account for home indicator
            borderTopWidth: 1,
            borderTopColor: 'rgba(243, 231, 211, 0.1)',
          }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                title="Back"
                variant="ghost"
                onPress={() => router.back()}
                // className -> style
                style={{ flex: 1 }}
              />
              <Button
                title={`Continue (${players.length})`}
                onPress={handleStartGame}
                disabled={players.length < 3}
                // className -> style
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
