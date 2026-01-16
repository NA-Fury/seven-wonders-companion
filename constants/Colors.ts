/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark modes.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { theme } from './theme';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: theme.colors.textPrimary,
    background: theme.colors.background,
    tint: theme.colors.accent,
    icon: 'rgba(243, 231, 211, 0.7)',
    tabIconDefault: 'rgba(243, 231, 211, 0.6)',
    tabIconSelected: theme.colors.accent,
  },
} as const;
