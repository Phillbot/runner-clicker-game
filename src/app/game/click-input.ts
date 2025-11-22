import { fromEvent, merge, Subscription } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

type Point = Readonly<{ x: number; y: number }>;
type OnPoint = (point: Point) => void;

export class ClickInput {
  private subscription: Subscription | null = null;
  private cachedRect: DOMRect | null = null;

  constructor(
    private readonly icon: HTMLElement,
    private readonly container: HTMLElement,
    private readonly onPoint: OnPoint,
  ) {}

  start(): void {
    this.cachedRect = this.container.getBoundingClientRect();

    const clicks$ = fromEvent<MouseEvent>(this.icon, 'click').pipe(
      throttleTime(10),
      map(event => this.toRelativePoint(event.clientX, event.clientY)),
    );

    const touches$ = fromEvent<TouchEvent>(this.icon, 'touchend').pipe(
      throttleTime(10),
      map(event =>
        this.toRelativePoint(
          event.changedTouches[0].clientX,
          event.changedTouches[0].clientY,
        ),
      ),
    );

    this.subscription = merge(clicks$, touches$).subscribe(point => {
      if (point) {
        this.onPoint(point);
      }
    });
  }

  dispose(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.cachedRect = null;
  }

  private toRelativePoint(clientX: number, clientY: number): Point {
    if (!this.cachedRect) {
      this.cachedRect = this.container.getBoundingClientRect();
    }

    const { left, top } = this.cachedRect;

    return { x: clientX - left, y: clientY - top };
  }
}
