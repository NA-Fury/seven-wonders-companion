// app/setup/_layout.tsx - Layout for setup routes
import { Stack } from 'expo-router';

export default function SetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="expansions" />
      <Stack.Screen name="seating" />
      <Stack.Screen name="wonders" />
      <Stack.Screen name="edifice" />
      <Stack.Screen name="game-summary" />
    </Stack>
  );
}
