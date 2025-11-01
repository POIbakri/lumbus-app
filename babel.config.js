module.exports = function (api) {
  api.cache(true);

  const plugins = [];

  // Only add worklets plugin if it exists (for build compatibility)
  try {
    require.resolve('react-native-worklets-core/plugin');
    plugins.push('react-native-worklets-core/plugin');
  } catch (e) {
    // Worklets plugin not available, skip it
  }

  // Add reanimated plugin last (it should be last in the plugins array)
  plugins.push([
    "react-native-reanimated/plugin",
    {
      processNestedWorklets: false
    }
  ]);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins,
  };
};
