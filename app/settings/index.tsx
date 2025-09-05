import React, { useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [subject, setSubject] = useState('Feedback: 7 Wonders Companion');
  const [message, setMessage] = useState('Hi! I would like to share…');

  const handleSend = async () => {
    const mailto = `mailto:feedback@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    try { await Linking.openURL(mailto); } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1A1A' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: '#C4A24C', fontSize: 22, fontWeight: '800' }}>Settings & Feedback</Text>
        <Text style={{ color: 'rgba(243,231,211,0.7)', marginTop: 4 }}>Send feedback and adjust preferences.</Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 10 }}>
        <Text style={{ color: 'rgba(243,231,211,0.9)' }}>Feedback</Text>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject"
          placeholderTextColor="#F3E7D380"
          style={{ backgroundColor: 'rgba(28,26,26,0.6)', color: '#F3E7D3', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)' }}
        />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message"
          placeholderTextColor="#F3E7D380"
          multiline
          numberOfLines={5}
          style={{ backgroundColor: 'rgba(28,26,26,0.6)', color: '#F3E7D3', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', textAlignVertical: 'top' }}
        />
        <Pressable
          onPress={handleSend}
          style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(196,162,76,0.8)' : '#C4A24C', borderRadius: 14, alignItems: 'center', paddingVertical: 12 })}
        >
          <Text style={{ color: '#1C1A1A', fontWeight: '800' }}>Send Feedback</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

