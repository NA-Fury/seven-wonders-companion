// Dynamic Expo config to avoid shipping placeholder Sentry DSN in dev
// Expo prefers app.config.* over app.json when both are present.

/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  // Use app.json values as base to satisfy expo-doctor
  const base = (() => {
    try {
      const aj = require('./app.json');
      return aj?.expo || {};
    } catch (e) {
      return {};
    }
  })();

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

  return {
    ...base,
    // Ensure critical fields exist even if app.json missing
    name: base.name || 'seven-wonders-companion',
    slug: base.slug || 'seven-wonders-companion',
    version: base.version || '1.0.0',
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
      ...(base.web || {}),
    },
    plugins: base.plugins || [
      'expo-router',
      ['@sentry/react-native/expo', { organization: 'gmv-ib', project: 'seven-wonders-companion' }],
    ],
    extra: {
      ...(base.extra || {}),
      ...(dsn ? { sentryDsn: dsn } : {}),
    },
    experiments: { typedRoutes: true, ...(base.experiments || {}) },
  };
};
