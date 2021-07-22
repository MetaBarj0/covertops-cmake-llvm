export abstract class Spy<T> {
  constructor(wrapped: T) {
    this.wrapped = wrapped;
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
  }

  private callCountMap: {
    [P in keyof T]?: number
  } = {};

  protected readonly wrapped: T;
}
