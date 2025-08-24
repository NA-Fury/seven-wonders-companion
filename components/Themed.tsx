// components/Themed.tsx
import React from 'react';
import { Pressable, Text as RNText, View as RNView } from 'react-native';

export const Screen = (props: any) => (
  <RNView className="flex-1 bg-obsidian">
    <RNView className="flex-1 px-4 pt-12 pb-6">{props.children}</RNView>
  </RNView>
);

export const H1 = ({ children }: { children: React.ReactNode }) => (
  <RNText className="text-3xl font-bold text-aurum mb-3">{children}</RNText>
);

export const P = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <RNText className={`text-base text-parchment/90 ${className}`}>{children}</RNText>
);

// Reusable button so that I never need Text.onPress
export const Button = ({
  title,
  onPress,
  className = '',
}: {
  title: string;
  onPress: () => void;
  className?: string;
}) => (
  <Pressable onPress={onPress} className={`bg-aurum rounded-2xl px-5 py-3 ${className}`}>
    <RNText className="text-obsidian text-center">{title}</RNText>
  </Pressable>
);
