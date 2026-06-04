import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  inject,
} from '@angular/core';

/**
 * Scroll reveal — auto-attaches to every `.r` element (matching the prototype).
 * A single shared IntersectionObserver (threshold 0.15, bottom rootMargin -12%)
 * adds the `in` class once, staggering siblings by 80ms via `transition-delay`,
 * then unobserves. Motion-off is handled purely in CSS, so this stays simple.
 */
@Directive({ selector: '.r' })
export class RevealDirective {
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (!this.isBrowser) {
      return;
    }
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => RevealDirective.observer().observe(this.host));
    });
    inject(DestroyRef).onDestroy(() => RevealDirective._observer?.unobserve(this.host));
  }

  // --- shared observer ------------------------------------------------------
  private static _observer: IntersectionObserver | null = null;

  private static observer(): IntersectionObserver {
    if (!this._observer) {
      this._observer = new IntersectionObserver(
        (entries, obs) => {
          for (const en of entries) {
            if (!en.isIntersecting) {
              continue;
            }
            const el = en.target as HTMLElement;
            const parent = el.parentElement;
            const sibs = parent
              ? Array.from(parent.querySelectorAll(':scope > .r'))
              : [];
            const i = Math.max(0, sibs.indexOf(el));
            el.style.transitionDelay = `${i * 80}ms`;
            el.classList.add('in');
            obs.unobserve(el);
          }
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
      );
    }
    return this._observer;
  }
}
