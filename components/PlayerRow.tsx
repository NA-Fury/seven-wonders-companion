import { Pressable, Text, View } from 'react-native';

export default function PlayerRow({ name, seat, onEdit }: { name: string; seat: number; onEdit?: () => void }) {
  return (
    <Pressable onPress={onEdit} className="flex-row items-center justify-between bg-parchment/10 rounded-2xl px-4 py-3 mb-2">
      <View>
        <Text className="text-parchment text-base">Seat {seat+1}</Text>
        <Text className="text-parchment/90 text-lg font-semibold">{name}</Text>
      </View>
      <Text className="text-aurum">Edit</Text>
    </Pressable>
  )
}