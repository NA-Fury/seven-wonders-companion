// Dynamic Expo config to avoid shipping placeholder Sentry DSN in dev
// Expo prefers app.config.* over app.json when both are present.

/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

  return {
    name: 'seven-wonders-companion',
    slug: 'seven-wonders-companion',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'sevenwonderscompanion',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      ['@sentry/react-native/expo', { organization: 'gmv-ib', project: 'seven-wonders-companion' }],
    ],
    extra: {
      ...(dsn ? { sentryDsn: dsn } : {}),
    },
    experiments: { typedRoutes: true },
  };
};

