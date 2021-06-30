import { OutputChannelLike } from '../../../src/shared-kernel/abstractions/vscode';

import { Spy } from "../../utils/spy";

export namespace errorChannel {
  export function buildFakeErrorChannel(): OutputChannelLike {
    return new class implements OutputChannelLike {
      appendLine(_line: string) { }
    };
  }

  export function buildSpyOfErrorChannel(errorChannel: OutputChannelLike): Spy<OutputChannelLike> {
    return new class extends Spy<OutputChannelLike> implements OutputChannelLike {
      constructor(errorChannel: OutputChannelLike) {
        super();

        this.errorChannel = errorChannel;
      }

      appendLine(line: string) {
        this.errorChannel.appendLine(line);
        this.incrementCallCountFor('appendLine');
      }

      get object() {
        return this;
      }

      private readonly errorChannel: OutputChannelLike;
    }(errorChannel);
  }
}