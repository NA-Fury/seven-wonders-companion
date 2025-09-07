// Keep guarded require for backwards compatibility with older test matchers.
// Migrate later to @testing-library/react-native built-in matchers (see migration guide).
// Ensure Expo winter runtime uses static imports in Jest
process.env.EXPO_USE_STATIC = process.env.EXPO_USE_STATIC || '1';

// Avoid Expo Winter runtime installing globals in Jest
// (no-op: handled by EXPO_USE_STATIC)

// Prefer built-in matchers from @testing-library/react-native >= 12.4
try {
  require('@testing-library/react-native/extend-expect');
} catch (e) {
  // Fallback for older versions (kept for compatibility)
  try {
    require('@testing-library/jest-native/extend-expect');
  } catch {}
}

jest.setTimeout(10000);
