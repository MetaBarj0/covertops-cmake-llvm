import { OutputChannelLike } from '../../../src/shared-kernel/abstractions/vscode';

import { Spy } from "../../utils/spy";

export function buildFakeErrorChannel(): OutputChannelLike {
  return new class implements OutputChannelLike {
    appendLine(_line: string) { }
  };
}

export function buildSpyOfErrorChannel(errorChannel: OutputChannelLike): Spy<OutputChannelLike> {
  return new class extends Spy<OutputChannelLike> implements OutputChannelLike {
    constructor(errorChannel: OutputChannelLike) {
      super(errorChannel);
    }

    appendLine(line: string) {
      this.decorated.appendLine(line);
      this.incrementCallCountFor('appendLine');
    }

    get object() {
      return this;
    }
  }(errorChannel);
}