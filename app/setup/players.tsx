// app/setup/players.tsx - Fixed version with proper scrolling and safe areas
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, TextInput, View, ScrollView } from 'react-native';
import { Button, Card, H1, H2, P, SetupScreen } from '../../components/ui';
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
    <SetupScreen
      footer={
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Button
              title="Back"
              variant="ghost"
              onPress={() => router.back()}
              className="w-full"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={`Continue (${players.length})`}
              onPress={handleStartGame}
              disabled={players.length < 3}
              className="w-full"
            />
          </View>
        </View>
      }
    >
      <H1>Players</H1>
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
                        onRemove={handleRemovePlayer}
                        style={{ marginBottom: 8 }}
                      />
                    ))}
                  </ScrollView>
                </View>
              </Card>
            )}
      <View style={{ height: 20 }} />
    </SetupScreen>
  );
}
