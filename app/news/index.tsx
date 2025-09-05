import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>News & Analysis</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>
          Coming soon: global leaderboards, patch notes, and analysis.
        </Text>
      </View>
    </SafeAreaView>
  );
}

