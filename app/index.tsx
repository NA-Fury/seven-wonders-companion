// app/index.tsx
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <Text style={{ 
          color: '#C4A24C', 
          fontSize: 24, 
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center'
        }}>
          7 Wonders Companion
        </Text>
        
        <Pressable
          onPress={() => router.push('./test-mobile')}
          style={{
            backgroundColor: '#C4A24C',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#1C1A1A', fontWeight: 'bold' }}>
            Test Navigation
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}