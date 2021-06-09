import packageJSON from "../../package.json";

export function defaultSetting(setting: DefaultSettingsKey | 'rootDirectory') {
  return isRootDirectory(setting) ? '.' : (() => {
    type Setting = typeof setting;
    const name = packageJSON.name;
    type Name = typeof name;
    type Key = `${Name}.${Setting}`;

    const key: Key = `${name}.${setting}`;

    const v = packageJSON.contributes.configuration[0].properties[key].default;

    return new DefaultSetting<Setting>(v).value;
  })();
}

export class Settings {
  constructor(cmakeCommand: string,
    buildTreeDirectory: string,
    cmakeTarget: string,
    coverageInfoFileName: string,
    additionalCmakeOptions: ReadonlyArray<string>,
    rootDirectory: string) {
    this.cmakeCommand = cmakeCommand;
    this.buildTreeDirectory = buildTreeDirectory;
    this.cmakeTarget = cmakeTarget;
    this.coverageInfoFileName = coverageInfoFileName;
    this.additionalCmakeOptions = additionalCmakeOptions;
    this.rootDirectory = rootDirectory;
  }

  readonly cmakeCommand: string;
  readonly buildTreeDirectory: string;
  readonly cmakeTarget: string;
  readonly coverageInfoFileName: string;
  readonly additionalCmakeOptions: ReadonlyArray<string>;
  readonly rootDirectory: string;
};

const configuration = packageJSON.contributes.configuration[0].properties;

type Configuration = typeof configuration;

type DefaultSettings = {
  [P in keyof Configuration as P extends string & `${infer _}.${infer T}` ? `${T}` : never]: Configuration[P]['default'];
};

class DefaultSetting<T extends keyof DefaultSettings>{
  constructor(value: DefaultSettings[T]) {
    this.value = value;
  }

  readonly value: DefaultSettings[T];
}

type DefaultSettingsKey = keyof DefaultSettings;

function isRootDirectory(setting: DefaultSettingsKey | 'rootDirectory'): setting is 'rootDirectory' {
  return (setting as 'rootDirectory') === 'rootDirectory';
}