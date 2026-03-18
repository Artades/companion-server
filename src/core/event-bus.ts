import { EventEmitter } from './event-emitter';
import { AppEvents } from './event.types';

export const eventBus = new EventEmitter<AppEvents>();
