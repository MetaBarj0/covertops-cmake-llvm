import { EventEmitter } from "events";

export abstract class Spy<T> {
  constructor(wrapped: T, eventEmitter?: EventEmitter) {
    this.wrapped = wrapped;
    this.eventEmitter = eventEmitter;
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

    this.eventEmitter?.emit("callCountIncremented", { member, count: this.callCountMap[member] });
  }

  protected readonly wrapped: T;

  private callCountMap: {
    [P in keyof T]?: number
  } = {};

  private readonly eventEmitter?: EventEmitter;
}
