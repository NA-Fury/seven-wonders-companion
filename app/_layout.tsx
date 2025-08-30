// app/_layout.tsx - Updated with proper scoring routes
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useScoringStore } from '../store/scoringStore';

useEffect(() => {
  (async () => {
    const raw = await AsyncStorage.getItem('gameCounter');
    const value = raw ? parseInt(raw, 10) : 0;
    useScoringStore.setState({ gameCounter: value });
  })();
}, []);


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Main index route */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Setup group routes */}
        <Stack.Screen name="setup" options={{ headerShown: false }} />
        
        {/* Scoring group routes */}
        <Stack.Screen name="scoring" options={{ headerShown: false }} />
        
        {/* Tabs if needed */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Test routes */}
        <Stack.Screen name="test-mobile" options={{ headerShown: false }} />
        
        {/* Not found */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}