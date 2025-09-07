import { useColorScheme as useRNColorScheme, Appearance } from "react-native";

export function useColorScheme(): "light" | "dark" {
  return (useRNColorScheme() ?? Appearance.getColorScheme() ?? "light") as "light" | "dark";
}