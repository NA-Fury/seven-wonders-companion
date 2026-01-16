import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Screen } from './Screen';
import { theme } from '@/constants/theme';

interface SetupScreenProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  keyboardOffset?: number;
}

export function SetupScreen({ children, footer, keyboardOffset = 0 }: SetupScreenProps) {
  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.background,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            paddingBottom: Platform.OS === 'ios' ? 34 : 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(243, 231, 211, 0.1)',
          }}
        >
          {footer}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
