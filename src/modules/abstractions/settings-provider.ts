import { Settings } from "./settings";

export type SettingsProvider = {
    get settings(): Settings;
};
