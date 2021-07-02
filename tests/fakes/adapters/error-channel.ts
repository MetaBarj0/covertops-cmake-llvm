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
      super();

      // TODO: all spy - put this in base class?
      this.errorChannel = errorChannel;
    }

    appendLine(line: string) {
      this.errorChannel.appendLine(line);
      this.incrementCallCountFor('appendLine');
    }

    // TODO: put this in base class?
    get object() {
      return this;
    }

    // TODO: put this in base class?
    private readonly errorChannel: OutputChannelLike;
  }(errorChannel);
}