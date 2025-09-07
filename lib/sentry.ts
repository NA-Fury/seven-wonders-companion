import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

let initialized = false;

function isValidDsn(dsn: unknown): dsn is string {
  if (typeof dsn !== 'string' || !dsn) return false;
  // Skip obvious placeholders
  if (dsn.includes('<') || dsn.includes('>')) return false;
  try {
    // Basic URL parse to avoid obvious invalid strings
    const u = new URL(dsn);
    return u.protocol.startsWith('http');
  } catch {
    return false;
  }
}

export async function initSentry() {
  if (initialized) return;
  const dsn =
    (Constants.expoConfig as any)?.extra?.sentryDsn ||
    process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!isValidDsn(dsn)) {
    if (__DEV__) console.warn('[sentry] DSN not set or placeholder; skipping init');
    return;
  }
  try {
    Sentry.init({
      dsn,
      debug: __DEV__,
      enableAutoSessionTracking: true,
      tracesSampleRate: 0.0, // opt-in later
    });
    initialized = true;
  } catch (e) {
    if (__DEV__) console.warn('[sentry] init failed, skipping:', e);
  }
}

export { Sentry };
