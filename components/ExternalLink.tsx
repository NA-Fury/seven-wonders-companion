import React, { ComponentProps } from "react";
import { Linking, Pressable, Text } from "react-native";

type Props = Omit<ComponentProps<typeof Pressable>, "onPress"> & {
  href: string;
  children?: React.ReactNode;
};

export function ExternalLink({ href, children, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      onPress={() => {
        if (href) Linking.openURL(href).catch(() => {});
      }}
    >
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </Pressable>
  );
}
