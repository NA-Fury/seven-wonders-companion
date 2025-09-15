module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: { '@': './' },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
        }
      ],
      // Must be last: required for Reanimated v4 (moved to worklets)
      'react-native-worklets/plugin'
    ]
  };
};
