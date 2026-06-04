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

/** Shared scroll-velocity boost applied to every marquee (matches prototype). */
const scrollBoost = { value: 0 };
let scrollBoostWired = false;
function wireScrollBoost(): void {
  if (scrollBoostWired) {
    return;
  }
  scrollBoostWired = true;
  let last = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      const st = window.scrollY;
      scrollBoost.value = Math.min(6, Math.abs(st - last) * 0.25);
      last = st;
    },
    { passive: true },
  );
  // Decay once per frame (shared), so it's independent of how many marquees read it.
  const decay = () => {
    scrollBoost.value *= 0.9;
    requestAnimationFrame(decay);
  };
  requestAnimationFrame(decay);
}

/**
 * Infinite marquee. Duplicates the track content once, then advances
 * `translateX` each frame by `direction × speed`, wrapping at `scrollWidth / 2`
 * for a seamless loop. Re-measures on resize. Adds a subtle scroll-velocity
 * boost. Halts movement when motion is off. Runs outside Angular.
 */
@Directive({ selector: '[appMarquee]' })
export class MarqueeDirective {
  /** Direction: 1 = left→right offset growth, -1 = opposite. */
  readonly direction = input<number>(1, { alias: 'appMarquee' });
  /** Base pixels-per-frame speed. */
  readonly speed = input<number>(0.5);

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private x = 0;
  private half = 0;
  private raf = 0;

  constructor() {
    if (!this.isBrowser) {
      return;
    }
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // Duplicate content once for a seamless wrap.
      this.host.innerHTML += this.host.innerHTML;
      this.measure();
      wireScrollBoost();

      const onResize = () => this.measure();
      window.addEventListener('resize', onResize);

      this.zone.runOutsideAngular(() => {
        const tick = () => {
          if (this.half) {
            const v = this.motion.motionEnabled() ? this.speed() + scrollBoost.value : 0;
            this.x += this.direction() * v;
            if (this.x <= -this.half) {
              this.x += this.half;
            }
            if (this.x >= 0) {
              this.x -= this.half;
            }
            this.host.style.transform = `translate3d(${this.x}px, 0, 0)`;
          }
          this.raf = requestAnimationFrame(tick);
        };
        this.raf = requestAnimationFrame(tick);
      });

      destroyRef.onDestroy(() => {
        window.removeEventListener('resize', onResize);
        if (this.raf) {
          cancelAnimationFrame(this.raf);
        }
      });
    });
  }

  private measure(): void {
    this.half = this.host.scrollWidth / 2;
  }
}
