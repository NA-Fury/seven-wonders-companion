import { Text, View } from 'react-native'

const steps = ['Expansions', 'Players', 'Seating', 'Wonders', 'Edifice', 'Scoring']

export function StepHeader({ current }: { current: number }) {
  return (
    <View className="flex-row flex-wrap mb-4">
      {steps.map((s, i) => (
        <View key={s} className="flex-row items-center mr-3 mb-2">
          <View className={`w-6 h-6 rounded-full items-center justify-center ${i <= current ? 'bg-aurum' : 'bg-parchment/20'}`}>
            <Text className={`${i <= current ? 'text-obsidian' : 'text-parchment/70'} text-xs`}>{i+1}</Text>
          </View>
          <Text className={`ml-2 ${i <= current ? 'text-parchment' : 'text-parchment/60'}`}>{s}</Text>
        </View>
      ))}
    </View>
  )
}