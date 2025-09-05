import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NOTES_KEY = 'swc-reference-notes';

export default function ReferenceScreen() {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTES_KEY);
        if (raw) setNotes(raw);
      } catch {}
    })();
  }, []);

  const persist = async (value: string) => {
    try {
      await AsyncStorage.setItem(NOTES_KEY, value);
      setSaved(new Date().toLocaleTimeString());
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Reference & Notes</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>Keep clarifications, house rules, and FAQs.</Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <TextInput
          value={notes}
          onChangeText={(t) => { setNotes(t); persist(t); }}
          placeholder="Type your notes here…"
          placeholderTextColor="#F3E7D380"
          multiline
          numberOfLines={10}
          style={{
            backgroundColor: 'rgba(28,26,26,0.6)',
            color: '#F3E7D3',
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: 'rgba(196,162,76,0.25)',
            minHeight: 220,
            textAlignVertical: 'top',
          }}
        />
        {saved && (
          <Text style={{ color: 'rgba(243,231,211,0.6)', marginTop: 6, fontSize: 12 }}>Saved {saved}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

