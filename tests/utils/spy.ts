export abstract class Spy<T> {
  constructor(decorated: T) {
    this.decorated = decorated;
  }

  abstract get object(): T;

  countFor(member: keyof T) {
    if (this.callCountMap[member] === undefined)
      return 0;

    return <number>this.callCountMap[member];
  }

  protected incrementCallCountFor(member: keyof T) {
    if (this.callCountMap[member] === undefined)
      this.callCountMap[member] = 0;

    (<number>this.callCountMap[member])++;
  }

  private callCountMap: {
    [P in keyof T]?: number
  } = {};

  protected readonly decorated: T;
};
