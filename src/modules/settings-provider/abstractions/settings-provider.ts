import { Settings } from "../abstractions/settings";

export type SettingsProvider = {
    get settings(): Settings;
};
