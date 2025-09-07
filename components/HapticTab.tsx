import React from "react";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        props.onPress?.(e);
      }}
      style={props.style as any}
    >
      {props.children}
    </Pressable>
  );
}