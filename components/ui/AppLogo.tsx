import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

type AppLogoProps = {
  size?: number;
  rounded?: boolean;
};

/**
 * Simple app logo component using the bundled icon asset.
 * Usage: <AppLogo size={72} />
 */
export function AppLogo({ size = 64, rounded = true }: AppLogoProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={require('../../assets/images/icon.png')}
        style={{ width: size, height: size, borderRadius: rounded ? size / 5 : 0 }}
        contentFit="cover"
      />
    </View>
  );
}

