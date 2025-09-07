import React, { ReactNode } from "react";
import { ScrollView, View } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";

type Props = {
  children: ReactNode;
  headerImage?: ReactNode;
  headerBackgroundColor?: { light: string; dark: string };
};

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme();
  const tabBarPadding = useBottomTabOverflow();
  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: tabBarPadding,
        backgroundColor: headerBackgroundColor?.[colorScheme]
      }}
    >
      {headerImage ? <View style={{ height: 200 }}>{headerImage}</View> : null}
      <View style={{ padding: 16 }}>{children}</View>
    </ScrollView>
  );
}
