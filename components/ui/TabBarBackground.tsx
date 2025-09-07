import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useBottomTabOverflow() {
  const insets = useSafeAreaInsets?.();
  return insets?.bottom ?? 0;
}

export default function TabBarBackground() {
  return <View style={{ backgroundColor: "transparent", flex: 1 }} />;
}
