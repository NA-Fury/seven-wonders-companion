// app.config.js
// Dynamic Expo config to avoid shipping placeholder Sentry DSN in dev
// Expo prefers app.config.* over app.json when both are present.

/**
 * Expo dynamic config that augments the static app.json values.
 * Using the passed `config` ensures expo-doctor recognizes we consume app.json.
 */
module.exports = ({ config }) => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  const projectId = process.env.EAS_PROJECT_ID || config?.extra?.eas?.projectId;

  // Build `extra` without placeholder DSN when env not provided
  const baseExtra = { ...(config.extra || {}) };
  if (!dsn && 'sentryDsn' in baseExtra) {
    delete baseExtra.sentryDsn;
  }

  return {
    ...config,

    // Pair OTA (EAS Update) with app version safety
    runtimeVersion: { policy: 'appVersion' },

    // Only set EAS Update URL if we know the projectId (prevents breaking local/dev)
    updates: projectId ? { url: `https://u.expo.dev/${projectId}` } : config.updates,

    // Optionally force Metro on web if not already set
    web: {
      bundler: (config.web && config.web.bundler) || 'metro',
      output: (config.web && config.web.output) || 'static',
      favicon: (config.web && config.web.favicon) || './assets/images/favicon.png',
      ...(config.web || {}),
    },

    // Preserve existing plugins; if missing, define defaults
    plugins: config.plugins || [
      'expo-router',
      ['@sentry/react-native/expo', { organization: 'gmv-ib', project: 'seven-wonders-companion' }],
    ],

    extra: {
      ...baseExtra,
      ...(dsn ? { sentryDsn: dsn } : {}),
      eas: { ...(baseExtra.eas || {}), projectId: projectId || (baseExtra.eas && baseExtra.eas.projectId) },
    },

    experiments: { typedRoutes: true, ...(config.experiments || {}) },
  };
};
