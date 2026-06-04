import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { MotionService } from '../core/motion.service';

interface ParallaxTarget {
  el: HTMLElement;
  factor: number;
}

/**
 * Vertical scroll parallax. Each `[appParallax]` element registers with a
 * single shared requestAnimationFrame loop that reads `scrollY` once per frame
 * and applies `translate3d(0, scrollY * factor * -1, 0)`. Skipped while motion
 * is off. The loop runs outside Angular and stops itself when no targets remain.
 */
@Directive({ selector: '[appParallax]' })
export class ParallaxDirective {
  /** Parallax factor, e.g. 0.04–0.12. */
  readonly appParallax = input.required<number>();

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (!this.isBrowser) {
      return;
    }
    const destroyRef = inject(DestroyRef);
    const loop = ParallaxLoop.get();
    afterNextRender(() => {
      const target: ParallaxTarget = { el: this.host, factor: this.appParallax() };
      loop.add(target);
      destroyRef.onDestroy(() => loop.remove(target));
    });
  }
}

/** Single shared rAF loop driving every parallax target. */
class ParallaxLoop {
  private static _instance: ParallaxLoop | null = null;
  static get(): ParallaxLoop {
    return (this._instance ??= new ParallaxLoop());
  }

  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private readonly targets = new Set<ParallaxTarget>();
  private raf = 0;

  add(t: ParallaxTarget): void {
    this.targets.add(t);
    this.start();
  }

  remove(t: ParallaxTarget): void {
    this.targets.delete(t);
    if (this.targets.size === 0 && this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private start(): void {
    if (this.raf) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      const tick = () => {
        const st = window.scrollY;
        if (this.motion.motionEnabled()) {
          for (const { el, factor } of this.targets) {
            el.style.transform = `translate3d(0, ${st * factor * -1}px, 0)`;
          }
        }
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    });
  }
}
