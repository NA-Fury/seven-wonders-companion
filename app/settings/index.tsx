import React, { useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Button, Card, Field, H1, P, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { openPrefilledBugReport, openDiscussions } from '../../lib/github';

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
    try { await openDiscussions(); } catch {}
  };

  const handleOpenGitHubProfile = async () => {
    try { await Linking.openURL('https://github.com/NA-Fury'); } catch {}
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <H1>Settings and Feedback</H1>
          <P>Send feedback and adjust preferences.</P>
        </View>

        <Card variant="muted">
          <Text style={styles.sectionTitle}>Feedback</Text>
          <Field
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            inputProps={{ placeholder: 'Subject' }}
          />
          <Field
            label="Message"
            value={message}
            onChangeText={setMessage}
            helperText="Include steps, expected result, and what happened."
            inputProps={{
              placeholder: 'Message',
              multiline: true,
              numberOfLines: 6,
            }}
          />
          <View style={styles.buttonRow}>
            <Button title="Report a Bug" onPress={() => openPrefilledBugReport(subject, message)} />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Send via Email" onPress={handleSendEmail} />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Use Gmail (Web)" variant="ghost" onPress={handleSendGmail} />
          </View>
        </Card>

        <Card variant="muted">
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.buttonRow}>
            <Button title="Open GitHub Issues" variant="ghost" onPress={handleOpenGitHubIssues} />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Open GitHub Discussions" variant="ghost" onPress={handleOpenGitHubDiscussions} />
          </View>
          <View style={styles.buttonRow}>
            <Button title="My GitHub Profile" variant="ghost" onPress={handleOpenGitHubProfile} />
          </View>
        </Card>

        <Text style={styles.footerText}>Thanks - every message helps improve the app.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.accent,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
  },
  buttonRow: {
    marginBottom: theme.spacing.sm,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
