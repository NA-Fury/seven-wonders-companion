module.exports = async () => {
  // Force Expo to use static imports in Jest to avoid runtime.native polyfills
  process.env.EXPO_USE_STATIC = process.env.EXPO_USE_STATIC || '1';
};
