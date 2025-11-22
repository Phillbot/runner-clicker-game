import { injectable } from 'inversify';

export type TimerHandler = () => void;

@injectable()
export class Scheduler {
  setTimeout(handler: TimerHandler, delay: number): number {
    return window.setTimeout(handler, delay);
  }

  clearTimeout(id: number | undefined | null): void {
    if (id !== undefined && id !== null) {
      window.clearTimeout(id);
    }
  }

  setInterval(handler: TimerHandler, delay: number): number {
    return window.setInterval(handler, delay);
  }

  clearInterval(id: number | undefined | null): void {
    if (id !== undefined && id !== null) {
      window.clearInterval(id);
    }
  }
}
