import { Settings } from '../../../../src/records/settings';

export function buildFakeSettings() {
  return <Settings>{
    cmakeCommand: 'foo',
    buildTreeDirectory: 'bar',
    cmakeTarget: 'baz',
    coverageInfoFileNamePatterns: ['fiz'],
    rootDirectory: 'buz'
  };
}

export function buildInvalidCmakeCommandSetting() {
  return buildFakeSettings();
}

export function buildInvalidBuildTreeDirectorySetting() {
  return buildFakeSettings();
}

export function buildInvalidCmakeTargetSetting() {
  return buildFakeSettings();
}

export function buildInvalidCoverageInfoFileNamePatternsSettings() {
  return buildFakeSettings();
}