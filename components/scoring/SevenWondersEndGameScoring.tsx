import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SevenWondersEndGameScoring() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#C4A24C', fontSize: 18 }}>
          Scoring Component Temporarily Disabled
        </Text>
      </View>
    </SafeAreaView>
  );
}