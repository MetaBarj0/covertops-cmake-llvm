export abstract class Spy<T> {
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
};
