const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Expo config plugin to set DEVELOPMENT_TEAM for widget extension target
 *
 * This is required for EAS builds because the widget extension target
 * needs a development team set for code signing with Xcode 14+
 */

const WIDGET_TARGET_NAME = 'LumbusWidget';

function withWidgetDevTeam(config, { devTeamId }) {
  if (!devTeamId) {
    console.log('⚠️  [WidgetDevTeam] No devTeamId provided, skipping...');
    return config;
  }

  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;

    // Get all build configurations
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();

    let updated = 0;
    for (const key in configurations) {
      if (typeof configurations[key].buildSettings !== 'undefined') {
        const buildSettings = configurations[key].buildSettings;
        const productName = buildSettings.PRODUCT_NAME;

        // Check if this is the widget extension target
        // Product name can be quoted or unquoted
        const isWidgetTarget =
          productName === `"${WIDGET_TARGET_NAME}"` ||
          productName === WIDGET_TARGET_NAME ||
          productName === '"$(TARGET_NAME)"';

        // Also check if this is any target that doesn't have DEVELOPMENT_TEAM set
        // and has a bundle identifier that matches our widget
        const bundleId = buildSettings.PRODUCT_BUNDLE_IDENTIFIER;
        const isWidgetBundleId = bundleId && (
          bundleId.includes('LumbusWidget') ||
          bundleId.includes('.widget') ||
          bundleId === '"com.lumbus.app.LumbusWidget"' ||
          bundleId === 'com.lumbus.app.LumbusWidget'
        );

        if (isWidgetTarget || isWidgetBundleId) {
          configurations[key].buildSettings.DEVELOPMENT_TEAM = devTeamId;
          configurations[key].buildSettings.CODE_SIGN_STYLE = 'Automatic';
          updated++;
        }
      }
    }

    // Also ensure all native targets have the development team
    const nativeTargets = xcodeProject.pbxNativeTargetSection();
    for (const key in nativeTargets) {
      const target = nativeTargets[key];
      if (target && target.name && (
        target.name === WIDGET_TARGET_NAME ||
        target.name === `"${WIDGET_TARGET_NAME}"`
      )) {
        // Get build configuration list for this target
        const configListKey = target.buildConfigurationList;
        const configList = xcodeProject.pbxXCConfigurationList()[configListKey];

        if (configList && configList.buildConfigurations) {
          configList.buildConfigurations.forEach(configRef => {
            const configKey = configRef.value;
            if (configurations[configKey] && configurations[configKey].buildSettings) {
              configurations[configKey].buildSettings.DEVELOPMENT_TEAM = devTeamId;
              configurations[configKey].buildSettings.CODE_SIGN_STYLE = 'Automatic';
            }
          });
        }
      }
    }

    console.log(`✅ [WidgetDevTeam] Set DEVELOPMENT_TEAM=${devTeamId} for ${updated} widget configurations`);

    return config;
  });
}

module.exports = withWidgetDevTeam;
