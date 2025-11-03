module.exports = function (api) {
  api.cache(true);

  const plugins = [];

  // Conditionally add worklets plugin if it exists (for Babel compatibility)
  // It's excluded from native builds in react-native.config.js
  try {
    require.resolve('react-native-worklets/plugin');
    plugins.push('react-native-worklets/plugin');
  } catch (e) {
    // Plugin not available, skip it
  }

  // Add reanimated plugin (should be last)
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins,
  };
};
