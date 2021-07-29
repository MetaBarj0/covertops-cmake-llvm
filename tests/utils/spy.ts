import { SpyEventEmitterFor } from "./spy-event-emitter-for";

export abstract class Spy<T> {
  constructor(wrapped: T, eventEmitter?: SpyEventEmitterFor<T>) {
    this.wrapped = wrapped;
    this.spyEventEmitter = eventEmitter;
  }

  abstract get object(): T;

  countFor(member: keyof T): number {
    if (this.callCountMap[member] === undefined)
      return 0;

    return <number>this.callCountMap[member];
  }

  protected incrementCallCountFor(member: keyof T): void {
    if (this.callCountMap[member] === undefined)
      this.callCountMap[member] = 0;

    (<number>this.callCountMap[member])++;

    this.spyEventEmitter?.fire("incrementedCallCount", member, this.callCountMap[member]);
  }

  protected readonly wrapped: T;

  private callCountMap: {
    [P in keyof T]?: number
  } = {};

  private readonly spyEventEmitter?: SpyEventEmitterFor<T>;
}
