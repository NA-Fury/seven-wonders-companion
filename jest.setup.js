// Keep guarded require for backwards compatibility with older test matchers.
// Migrate later to @testing-library/react-native built-in matchers (see migration guide).
try {
  require('@testing-library/jest-native/extend-expect');
} catch (e) {
  // package not present — tests still run
}
jest.setTimeout(10000);
