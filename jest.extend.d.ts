// Make the custom matchers (e.g., toHaveStyle) visible to TypeScript in test files.
// Prefer RN Testing Library's built-in extend-expect (v12.4+), which re-exports jest-native.
import '@testing-library/react-native/extend-expect';

// If you ever downgrade @testing-library/react-native below 12.4,
// you can uncomment the fallback below:
// import '@testing-library/jest-native/extend-expect';
// See: https://github.com/callstack/react-native-testing-library/issues/1234