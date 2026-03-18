type Events = Record<string, unknown>;
type Listener<Data = any> = (data: Data) => void;

export class EventEmitter<EventsData extends Events> {
  private listeners: Map<keyof EventsData, Set<Listener>> = new Map();

  on<Key extends keyof EventsData>(event: Key, cb: Listener<EventsData[Key]>) {
    let eventListenersSet = this.listeners.get(event);

    if (!eventListenersSet) {
      eventListenersSet = new Set([cb]);
      this.listeners.set(event, eventListenersSet);
    } else {
      eventListenersSet?.add(cb);
    }

    return () => {
      eventListenersSet.delete(cb);
    };
  }

  emit<Key extends keyof EventsData>(
    event: Key,
    ...args: EventsData[Key] extends void ? [] : [EventsData[Key]]
  ) {
    const eventListenersSet = this.listeners.get(event);

    if (eventListenersSet) {
      eventListenersSet.forEach((listener) => {
        listener(args[0]);
      });
    }
  }
}
