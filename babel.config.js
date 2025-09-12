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
      // Must be last: required for react-native-reanimated
      'react-native-reanimated/plugin'
    ]
  };
};
