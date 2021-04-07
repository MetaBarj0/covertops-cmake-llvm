import { Settings } from "../../../cppLlvmCoverage";

export function buildFakeSettings() {
  return <Settings>{
    cmakeCommand: 'foo',
    buildTreeDirectory: 'bar',
    cmakeTarget: 'baz',
    coverageInfoFileNamePatterns: ['fiz'],
    cwd: 'buz'
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