import packageJSON from "../../src/package.json";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function defaultSetting(setting: DefaultSettingsKey | "rootDirectory") {
  return isRootDirectory(setting) ? "." : (() => {
    type Setting = typeof setting;
    const name = packageJSON.name;
    type Name = typeof name;
    type Key = `${Name}.${Setting}`;

    const key: Key = `${name}.${setting}`;

    const v = packageJSON.contributes.configuration[0].properties[key].default;

    return new DefaultSetting<Setting>(v).value;
  })();
}

const configuration = packageJSON.contributes.configuration[0].properties;

type Configuration = typeof configuration;

type DefaultSettings = {
  [P in keyof Configuration as P extends `${infer _}.${infer T}` ? `${T}` : never]: Configuration[P]["default"];
};

class DefaultSetting<T extends keyof DefaultSettings>{
  constructor(value: DefaultSettings[T]) {
    this.value = value;
  }

  readonly value: DefaultSettings[T];
}

type DefaultSettingsKey = keyof DefaultSettings;

function isRootDirectory(setting: DefaultSettingsKey | "rootDirectory"): setting is "rootDirectory" {
  return (setting as "rootDirectory") === "rootDirectory";
}
