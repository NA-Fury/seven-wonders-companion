// app/scoring/_layout.tsx - Layout for scoring routes
import { Stack } from 'expo-router';

export default function ScoringLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="results" />
    </Stack>
  );
}