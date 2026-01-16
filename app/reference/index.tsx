import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Field, H1, P, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';

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
    <Screen>
      <View style={{ marginBottom: theme.spacing.md }}>
        <H1>Reference and Notes</H1>
        <P>Keep clarifications, house rules, and FAQs.</P>
      </View>
      <Field
        label="Notes"
        value={notes}
        onChangeText={(t) => { setNotes(t); persist(t); }}
        helperText={saved ? `Saved ${saved}` : 'Autosaves as you type.'}
        inputProps={{
          placeholder: 'Type your notes here.',
          multiline: true,
          numberOfLines: 10,
        }}
      />
    </Screen>
  );
}
