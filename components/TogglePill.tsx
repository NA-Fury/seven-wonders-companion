import { Pressable, Text } from 'react-native';

export function TogglePill({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      className={`mr-2 mb-2 rounded-full px-4 py-2 border ${on ? 'bg-aurum border-aurum' : 'bg-transparent border-parchment/30'}`}
    >
      <Text className={`text-sm ${on ? 'text-obsidian' : 'text-parchment/90'}`}>{label}</Text>
    </Pressable>
  )
}