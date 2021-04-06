import { Settings } from "../../../cppLlvmCoverage";

export function buildInvalidAllSettings() {
  return <Settings>{
    cmakeCommand: 'foo',
    buildTreeDirectory: 'bar',
    cmakeTarget: 'baz',
    coverageInfoFileNamePatterns: ['fiz'],
    cwd: 'buz'
  };
}

export function buildInvalidCmakeCommandSetting() {
  return buildInvalidAllSettings();
}

export function buildInvalidBuildTreeDirectorySetting() {
  return buildInvalidAllSettings();
}

export function buildAnySettings() {
  return buildInvalidAllSettings();
}

export function buildInvalidCmakeTargetSetting() {
  return buildInvalidAllSettings();
}