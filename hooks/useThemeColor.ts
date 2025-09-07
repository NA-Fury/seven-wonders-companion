/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type ThemeProps = { light?: string; dark?: string };

// colorName should be a key present in Colors.light/dark (e.g., 'text', 'background', 'tint', 'icon', ...)
export function useThemeColor(props: ThemeProps, colorName: keyof typeof Colors.light) {
  const theme = useColorScheme();
  return props[theme] ?? Colors[theme][colorName];
}
