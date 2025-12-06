const { withXcodeProject, withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to add a pure Swift iOS Widget Extension
 * This widget is completely independent of React Native
 */

const WIDGET_NAME = 'LumbusWidget';
const WIDGET_BUNDLE_ID = 'com.lumbus.app.widget';
const APP_GROUP = 'group.com.lumbus.shared';
const DEVELOPMENT_TEAM = 'MQY423BU9T';

function withIOSWidget(config) {
  // Add App Group entitlement to main app
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.security.application-groups'] = [APP_GROUP];
    return config;
  });

  // Add widget extension to Xcode project
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const widgetSourcePath = path.join(projectRoot, 'ios', WIDGET_NAME);

    // Check if widget source exists
    if (!fs.existsSync(widgetSourcePath)) {
      console.log(`[withIOSWidget] Widget source not found at ${widgetSourcePath}, skipping...`);
      return config;
    }

    const targetUuid = xcodeProject.generateUuid();
    const groupUuid = xcodeProject.generateUuid();
    const buildConfigDebugUuid = xcodeProject.generateUuid();
    const buildConfigReleaseUuid = xcodeProject.generateUuid();
    const buildConfigListUuid = xcodeProject.generateUuid();
    const productFileUuid = xcodeProject.generateUuid();
    const containerItemProxyUuid = xcodeProject.generateUuid();
    const targetDependencyUuid = xcodeProject.generateUuid();
    const buildPhaseSourcesUuid = xcodeProject.generateUuid();
    const buildPhaseResourcesUuid = xcodeProject.generateUuid();
    const buildPhaseFrameworksUuid = xcodeProject.generateUuid();

    // Add widget group to project
    const widgetGroup = xcodeProject.addPbxGroup(
      [
        'LumbusWidget.swift',
        'LumbusWidgetBundle.swift',
        'Info.plist',
      ],
      WIDGET_NAME,
      WIDGET_NAME
    );

    // Get the main group and add widget group reference
    const mainGroup = xcodeProject.getFirstProject().firstProject.mainGroup;
    xcodeProject.addToPbxGroup(widgetGroup.uuid, mainGroup);

    // Add files to build phases
    const swiftFiles = ['LumbusWidget.swift', 'LumbusWidgetBundle.swift'];
    const fileRefs = [];

    swiftFiles.forEach((fileName) => {
      const filePath = path.join(WIDGET_NAME, fileName);
      const fileRef = xcodeProject.addFile(filePath, widgetGroup.uuid, {
        target: targetUuid,
        lastKnownFileType: 'sourcecode.swift',
      });
      if (fileRef) {
        fileRefs.push(fileRef);
      }
    });

    // Create build configurations for widget
    const commonBuildSettings = {
      ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: 'AccentColor',
      ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME: 'WidgetBackground',
      CODE_SIGN_STYLE: 'Automatic',
      CURRENT_PROJECT_VERSION: '1',
      DEVELOPMENT_TEAM: DEVELOPMENT_TEAM,
      GENERATE_INFOPLIST_FILE: 'YES',
      INFOPLIST_FILE: `${WIDGET_NAME}/Info.plist`,
      INFOPLIST_KEY_CFBundleDisplayName: 'Lumbus Widget',
      INFOPLIST_KEY_NSHumanReadableCopyright: '',
      IPHONEOS_DEPLOYMENT_TARGET: '16.0',
      LD_RUNPATH_SEARCH_PATHS: '$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks',
      MARKETING_VERSION: '1.0',
      PRODUCT_BUNDLE_IDENTIFIER: WIDGET_BUNDLE_ID,
      PRODUCT_NAME: '$(TARGET_NAME)',
      SKIP_INSTALL: 'YES',
      SWIFT_EMIT_LOC_STRINGS: 'YES',
      SWIFT_VERSION: '5.0',
      TARGETED_DEVICE_FAMILY: '1,2',
    };

    xcodeProject.addXCBuildConfiguration(
      {
        ...commonBuildSettings,
        DEBUG_INFORMATION_FORMAT: 'dwarf',
        MTL_ENABLE_DEBUG_INFO: 'INCLUDE_SOURCE',
        SWIFT_OPTIMIZATION_LEVEL: '-Onone',
      },
      'Debug',
      buildConfigDebugUuid
    );

    xcodeProject.addXCBuildConfiguration(
      {
        ...commonBuildSettings,
        DEBUG_INFORMATION_FORMAT: 'dwarf-with-dsym',
        MTL_ENABLE_DEBUG_INFO: 'NO',
        SWIFT_OPTIMIZATION_LEVEL: '-Owholemodule',
      },
      'Release',
      buildConfigReleaseUuid
    );

    // Create XCConfigurationList for widget target
    xcodeProject.addXCConfigurationList(
      [
        { uuid: buildConfigDebugUuid, name: 'Debug' },
        { uuid: buildConfigReleaseUuid, name: 'Release' },
      ],
      'Release',
      buildConfigListUuid
    );

    // Add native target for widget
    const widgetTarget = xcodeProject.addTarget(
      WIDGET_NAME,
      'app_extension',
      WIDGET_NAME,
      WIDGET_BUNDLE_ID,
      targetUuid,
      buildConfigListUuid
    );

    // Add target dependency to main app
    const mainTarget = xcodeProject.getFirstTarget();
    if (mainTarget) {
      xcodeProject.addTargetDependency(mainTarget.firstTarget, [targetUuid]);
    }

    // Add widget product to embed extension build phase
    xcodeProject.addBuildPhase(
      [],
      'PBXCopyFilesBuildPhase',
      'Embed App Extensions',
      mainTarget?.firstTarget?.uuid,
      'app_extension',
      '"$(CONTENTS_FOLDER_PATH)/PlugIns"'
    );

    console.log(`[withIOSWidget] Added ${WIDGET_NAME} extension to Xcode project`);

    return config;
  });

  return config;
}

module.exports = withIOSWidget;
