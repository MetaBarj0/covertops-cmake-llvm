import packageJSON from "./package.json";

export const extensionNameInSettings = packageJSON.contributes.configuration[0].title;
export const extensionId = packageJSON.name;
export const extensionDisplayName = packageJSON.displayName;
export const uncoveredCodeRegionDecorationBackgroundColorId = packageJSON.contributes.colors[0].id;
export const outdatedUncoveredCodeRegionDecorationBackgroundColorId = packageJSON.contributes.colors[1].id;
