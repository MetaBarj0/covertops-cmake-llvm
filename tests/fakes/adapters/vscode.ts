import * as Types from "../../../src/types";

import { defaultSetting } from "../../builders/settings";
import { Spy } from "../../utils/spy";

type Overrides = {
  -readonly [Property in keyof Types.Modules.SettingsProvider.Settings]?: Types.Modules.SettingsProvider.Settings[Property]
};

export function buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(overrides: Overrides = {}): Types.Adapters.Vscode.VscodeWorkspaceLike {
  return new class implements Types.Adapters.Vscode.VscodeWorkspaceLike {
    constructor(overrides: Overrides) {
      this.overrides = overrides;
    }

    registerTextDocumentContentProvider(_scheme: string, _provider: Types.Adapters.Vscode.TextDocumentContentProviderLike): Types.Adapters.Vscode.DisposableLike {
      throw new Error("Method not implemented.");
    }

    workspaceFolders = [
      new class implements Types.Adapters.Vscode.VscodeWorkspaceFolderLike {
        uri = new class implements Types.Adapters.Vscode.VscodeUriLike {
          fsPath = defaultSetting("rootDirectory").toString();
        };
      }];

    getConfiguration(_section?: string) {
      return new class implements Types.Adapters.Vscode.VscodeWorkspaceConfigurationLike {
        constructor(overrides: Overrides) {
          this.overrides = overrides;
        }

        get(section: keyof Types.Modules.SettingsProvider.Settings) {
          if (this.overrides[section])
            return <Types.Modules.SettingsProvider.Settings[typeof section]>this.overrides[section];

          return defaultSetting(section);
        }

        async update(_section: string, _value: unknown) { }

        private overrides: Overrides;
      }(this.overrides);
    }

    private overrides: Overrides;
  }(overrides);
}

export function buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(): Types.Adapters.Vscode.VscodeWorkspaceLike {
  return new class implements Types.Adapters.Vscode.VscodeWorkspaceLike {

    registerTextDocumentContentProvider(_scheme: string, _provider: Types.Adapters.Vscode.TextDocumentContentProviderLike): Types.Adapters.Vscode.DisposableLike {
      throw new Error("Method not implemented.");
    }
    workspaceFolders = undefined;

    getConfiguration(_section?: string) {
      return new class implements Types.Adapters.Vscode.VscodeWorkspaceConfigurationLike {
        get(section: keyof Types.Modules.SettingsProvider.Settings) {
          return defaultSetting(section);
        }

        async update(_section: string, _value: unknown) { }
      };
    }
  };
}

export function buildFakeOutputChannel(): Types.Adapters.Vscode.OutputChannelLikeWithLines {
  return new class implements Types.Adapters.Vscode.OutputChannelLikeWithLines {
    appendLine(_line: string) { }

    dispose() { }

    clear() { }

    show(_preserveFocus: boolean) { }

    get lines() {
      return [];
    }
  };
}

export function buildSpyOfOutputChannel(outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines): Spy<Types.Adapters.Vscode.OutputChannelLikeWithLines> {
  return new class extends Spy<Types.Adapters.Vscode.OutputChannelLikeWithLines> implements Types.Adapters.Vscode.OutputChannelLikeWithLines {
    constructor(outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines) {
      super(outputChannel);
    }

    appendLine(line: string) {
      this.wrapped.appendLine(line);
      this.incrementCallCountFor("appendLine");
    }

    dispose() {
      this.wrapped.dispose();
      this.incrementCallCountFor("dispose");
    }

    clear() {
      this.wrapped.clear();
      this.incrementCallCountFor("clear");
    }

    show(preserveFocus: boolean) {
      this.wrapped.show(preserveFocus);
      this.incrementCallCountFor("show");
    }

    get lines() {
      this.incrementCallCountFor("lines");

      return this.wrapped.lines;
    }

    get object() {
      return this;
    }
  }(outputChannel);
}

export function buildFakeProgressReporter(): Types.Adapters.Vscode.ProgressLike {

  return new class implements Types.Adapters.Vscode.ProgressLike {
    report(_value: Types.Adapters.Vscode.ProgressStep) { }
  };
}

export function buildSpyOfProgressReporter(progressReporter: Types.Adapters.Vscode.ProgressLike): Spy<Types.Adapters.Vscode.ProgressLike> {
  return new class extends Spy<Types.Adapters.Vscode.ProgressLike> implements Types.Adapters.Vscode.ProgressLike {
    constructor(progressReporter: Types.Adapters.Vscode.ProgressLike) {
      super(progressReporter);
    }

    report(value: Types.Adapters.Vscode.ProgressStep) {
      this.wrapped.report(value);
      super.incrementCallCountFor("report");
    }

    get object() {
      return this;
    }
  }(progressReporter);
}
