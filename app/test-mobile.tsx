// app/test-mobile.tsx (Simple test to isolate issues)
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function TestMobileScreen() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#1C1A1A',
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{
        color: '#C4A24C',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      }}>
        Mobile Test Screen
      </Text>
      
      <Text style={{
        color: '#F3E7D3',
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
      }}>
        If you can see this, basic navigation works on mobile!
      </Text>
      
      <Pressable
        onPress={() => router.push('/')}
        style={{
          backgroundColor: '#C4A24C',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#1C1A1A', fontWeight: 'bold' }}>
          Go to Home
        </Text>
      </Pressable>
      
      <Pressable
        onPress={() => router.push('./setup/expansions')}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#C4A24C',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#C4A24C', fontWeight: 'bold' }}>
          Test Setup Flow
        </Text>
      </Pressable>
    </View>
  );
}