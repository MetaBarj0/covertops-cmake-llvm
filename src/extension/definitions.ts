import packageJSON from '../package.json';

export const extensionNameInSettings = packageJSON.contributes.configuration[0].title;
export const extensionId = packageJSON.name;
export const extensionDisplayName = packageJSON.displayName;
export const uncoveredCodeRegionDecorationBackgroundColor = packageJSON.contributes.colors[0].id;