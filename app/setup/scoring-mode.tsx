import { useRouter } from 'expo-router';
import { Pressable, Text as RNText, View } from 'react-native';
import { StepHeader } from '../../components/StepHeader';
import { Button, H1, P, Screen } from '../../components/Themed';
import { useSetupStore } from '../../lib/store';

export default function ScoringMode() {
  const router = useRouter();
  const mode = useSetupStore((s) => s.setup.scoringMode);
  const setMode = useSetupStore((s) => s.setScoringMode);

  const handleContinue = () => {
    router.push('/setup/game-summary');
  };

  return (
    <Screen>
      <StepHeader current={5} />
      <H1>Scoring Mode</H1>
      <P className="mb-4">Choose how you’ll input scores.</P>
      <View className="flex-row mb-6">
        <Pressable onPress={() => setMode('PerAge')} className={`mr-3 rounded-2xl px-4 py-3 ${mode === 'PerAge' ? 'bg-aurum' : 'bg-parchment/10'}`}>
          <RNText className={mode === 'PerAge' ? 'text-obsidian' : 'text-parchment'}>Per Age (Deep Analysis)</RNText>
        </Pressable>
        <Pressable onPress={() => setMode('FinalOnly')} className={`rounded-2xl px-4 py-3 ${mode === 'FinalOnly' ? 'bg-aurum' : 'bg-parchment/10'}`}>
          <RNText className={mode === 'FinalOnly' ? 'text-obsidian' : 'text-parchment'}>Final Only (Quick)</RNText>
        </Pressable>
      </View>
      <Button title="Finish Setup" onPress={handleContinue} />
    </Screen>
  );
}
