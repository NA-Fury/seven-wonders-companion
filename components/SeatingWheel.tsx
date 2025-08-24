import { Text, View } from 'react-native'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'

export default function SeatingWheel({ names }: { names: string[] }) {
  const n = names.length || 1
  const radius = 100
  return (
    <View className="items-center">
      <Svg width={260} height={260}>
        <Circle cx={130} cy={130} r={radius} stroke="#C4A24C" strokeWidth={2} fill="none" />
        {names.map((nm, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2
          const x = 130 + (radius - 10) * Math.cos(angle)
          const y = 130 + (radius - 10) * Math.sin(angle)
          return (
            <SvgText key={i} x={x} y={y} fontSize={12} fill="#F3E7D3" textAnchor="middle">
              {i+1}. {nm}
            </SvgText>
          )
        })}
      </Svg>
      <Text className="text-parchment/70 mt-2">Arrange seats clockwise. Neighbors auto‑calculated.</Text>
    </View>
  )
}