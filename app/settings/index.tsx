import React, { useMemo, useState } from 'react';
import { Linking, Pressable, Text, TextInput, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const appVersion = useMemo(() => {
    const v = Constants.expoConfig?.version || (Constants as any)?.manifest2?.extra?.expoClient?.version || 'dev';
    return v;
  }, []);

  const [subject, setSubject] = useState(
    `Feedback: 7 Wonders Companion v${appVersion} (${Platform.OS})`
  );
  const [message, setMessage] = useState(
    'Hi! I would like to share some feedback about the app.\n\nWhat happened:\n\nSteps to reproduce:\n\nExpected vs actual:\n\n(Feel free to add screenshots)'
  );

  const emailTo = 'naziha2305@gmail.com';

  const handleSendEmail = async () => {
    const mailto = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    try { await Linking.openURL(mailto); } catch {}
  };

  const handleSendGmail = async () => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTo)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    try { await Linking.openURL(url); } catch {}
  };

  const handleOpenGitHubIssues = async () => {
    try { await Linking.openURL('https://github.com/NA-Fury/seven-wonders-companion/issues'); } catch {}
  };

  const handleOpenGitHubDiscussions = async () => {
    try { await Linking.openURL('https://github.com/NA-Fury/seven-wonders-companion/discussions'); } catch {}
  };

  const handleOpenGitHubProfile = async () => {
    try { await Linking.openURL('https://github.com/NA-Fury'); } catch {}
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
          onPress={handleSendEmail}
          style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(196,162,76,0.8)' : '#C4A24C', borderRadius: 14, alignItems: 'center', paddingVertical: 12 })}
        >
          <Text style={{ color: '#1C1A1A', fontWeight: '800' }}>Send via Email</Text>
        </Pressable>

        <Pressable
          onPress={handleSendGmail}
          style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(243,231,211,0.08)' : 'rgba(31,41,55,0.5)', borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', borderRadius: 14, alignItems: 'center', paddingVertical: 12 })}
        >
          <Text style={{ color: '#FEF3C7', fontWeight: '800' }}>Use Gmail (Web)</Text>
        </Pressable>

        <Pressable
          onPress={handleOpenGitHubIssues}
          style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(243,231,211,0.08)' : 'rgba(31,41,55,0.5)', borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', borderRadius: 14, alignItems: 'center', paddingVertical: 12 })}
        >
          <Text style={{ color: '#FEF3C7', fontWeight: '800' }}>Open GitHub Issues</Text>
        </Pressable>

        <Pressable
          onPress={handleOpenGitHubDiscussions}
          style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(243,231,211,0.08)' : 'rgba(31,41,55,0.5)', borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', borderRadius: 14, alignItems: 'center', paddingVertical: 12 })}
        >
          <Text style={{ color: '#FEF3C7', fontWeight: '800' }}>Open GitHub Discussions</Text>
        </Pressable>

        <Pressable
          onPress={handleOpenGitHubProfile}
          style={({ pressed }) => ({ backgroundColor: pressed ? 'rgba(243,231,211,0.08)' : 'rgba(31,41,55,0.5)', borderWidth: 1, borderColor: 'rgba(196,162,76,0.25)', borderRadius: 14, alignItems: 'center', paddingVertical: 12 })}
        >
          <Text style={{ color: '#FEF3C7', fontWeight: '800' }}>My GitHub Profile</Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Text style={{ color: 'rgba(243,231,211,0.6)', fontSize: 12 }}>Thanks — every message helps improve the app.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

