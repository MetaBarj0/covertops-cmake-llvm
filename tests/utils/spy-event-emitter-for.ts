import { EventEmitter } from "events";

export class SpyEventEmitterFor<T> extends EventEmitter {
  constructor(settings: SpyEventEmitterOptions<T>, baseOptions?: EventEmitterOptions) {
    super(baseOptions);

    this.settings = settings;
  }

  fire(eventType: EventTypes, member: keyof T, ...eventArgs: unknown[]): void {
    if (eventType !== this.settings.eventType)
      return;

    if (member !== this.settings.member)
      return;

    this.emit(eventType, {
      member,
      eventArgs
    });
  }

  override on(eventType: EventTypes, listener: (...args: unknown[]) => void): this {
    return super.on(eventType, listener);
  }

  onIncrementedCallCount(listener: (count: number) => void): this {
    return this.on("incrementedCallCount", (...args: unknown[]) => {
      const eventArgs = args[0] as SpyEventArgs<T>;
      const member = eventArgs.member;

      if (member !== this.settings.member)
        return;

      const count = eventArgs.eventArgs[0] as number;

      listener(count);
    });
  }

  private settings: SpyEventEmitterOptions<T>;
}

type EventEmitterOptions = ConstructorParameters<typeof EventEmitter>[0];

type EventTypes = "incrementedCallCount";

type SpyEventEmitterOptions<T> = {
  eventType: EventTypes,
  member: keyof T
};

type SpyEventArgs<T> = {
  member: keyof T,
  eventArgs: unknown[]
}
