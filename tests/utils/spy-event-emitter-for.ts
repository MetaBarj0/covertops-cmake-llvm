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
      ...eventArgs
    });
  }

  // TODO: more specific on* function (onIncrementedCallCount for instance)
  override on(eventType: EventTypes, listener: (...args: unknown[]) => void): this {
    return super.on(eventType, listener);
  }

  private settings: SpyEventEmitterOptions<T>;
}

type EventEmitterOptions = ConstructorParameters<typeof EventEmitter>[0];

type EventTypes = "incrementedCallCount";

type SpyEventEmitterOptions<T> = {
  eventType: EventTypes,
  member: keyof T
};
