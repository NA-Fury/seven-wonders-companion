// Enable Sentry Metro plugin when available and keep Expo defaults
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

let maybeWithSentry;
try {
  // Try both named and default export shapes across Sentry versions
  const sentryMetro = require('@sentry/react-native/metro');
  maybeWithSentry = sentryMetro?.withSentry || sentryMetro;
} catch (e) {
  // Plugin not available in this @sentry/react-native version
  maybeWithSentry = undefined;
}

module.exports = typeof maybeWithSentry === 'function' ? maybeWithSentry(config) : config;
