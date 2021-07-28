import * as Definitions from "./definitions";

export const commandReportUncoveredCodeRegionsInFile = `${Definitions.extensionId}.reportUncoveredCodeRegionsInFile`;
export const decorationUncoveredCodeRegionHoverMessage = "This code region is not covered by a test known by cmake." as const;
export const errorBadAbsolutePathForBuildTreeDirectoryWithArg = `Incorrect absolute path specified in '${Definitions.extensionNameInSettings}: ` +
    "Build Tree Directory'. It must be a relative path.";
export const errorCannotStatCreateBuildTreeDirectory = "Cannot find or create the build tree directory. Ensure the " +
    `'${Definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`;
export const errorInvalidCoverageInfoFileContent = "Invalid coverage information file have been found in the build tree directory. " +
    "Coverage information file must contain llvm coverage report in json format. " +
    "Ensure that both " +
    `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
    `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
    "settings are correctly set.";
export const errorNoMatchForCoverageInfoFile = "Cannot resolve the coverage info file path in the build tree directory. " +
    "Ensure that both " +
    `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
    `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
    "settings are correctly set.";
export const errorSeveralMatchForCoverageInfoFile = "More than one coverage information file have been found in the build tree directory. " +
    "Ensure that both " +
    `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
    `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
    "settings are correctly set.";
export const errorUnreachableCmake = `Cannot find the cmake command. Ensure the '${Definitions.extensionNameInSettings}: Cmake Command' ` +
    "setting is correctly set. Have you verified your PATH environment variable?";
export const errorWorkspaceNotLoaded = "A workspace must be loaded to get coverage information." as const;
export const progressComputingRegionsLocations = "Computing uncovered code region locations" as const;
export const progressCoverageInfoReady = "Prepared summary and uncovered region of code information." as const;
export const progressFoundCMake = "Found an invocable cmake command." as const;
export const progressGeneratedCmakeProject = "Generated the cmake project." as const;
export const progressResolvedBuildTreeDirectory = "Resolved build tree directory path." as const;
export const progressResolvedLLVMFile = "Resolved the LLVM coverage information file path." as const;
export const progressTargetBuilt = "Built the target." as const;
export const reportExtensionStarting = `starting ${Definitions.extensionDisplayName}`;

export const errorNoSummaryCoverageInfoFor = (sourceFilePath: string): string => "Cannot find any summary coverage info for the file " +
    `${sourceFilePath}. Ensure this source file is covered by a test in your project.`;
export const errorWhenBuildingTargetNamed = (cmakeTarget: string): string => `Error: Could not build the specified cmake target ${cmakeTarget}. ` +
    `Ensure '${Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`;
export const errorWhenGeneratingCmakeProjectLocatedIn = (rootDirectory: string): string => "Cannot generate the cmake project in the " +
    `${rootDirectory} directory. ` +
    "Ensure either you have opened a valid cmake project, or the cmake project has not already been generated using different options. " +
    `You may have to take a look in '${Definitions.extensionNameInSettings}: Additional Cmake Options' settings ` +
    "and check the generator used is correct for instance.";
export const reportNoUncoveredCodeRegionsInfoFor = (sourceFilePath: string): string => "Cannot find any uncovered code regions for the file " +
    `${sourceFilePath}. Ensure this source file is covered by a test in your project.`;
