import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { IntroService } from '../../core/intro.service';
import { MotionService } from '../../core/motion.service';

/**
 * Intro curtain: a mono counter ticking 00→100 while an accent fill wipes a
 * hairline bar. On 100 the overlay slides up and the hero reveals. Starts as
 * soon as fonts settle (capped ~900ms) rather than waiting on window.load, with
 * a hard fallback. Skipped entirely when motion is off / reduced.
 */
@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="intro" [class.done]="done()">
        <div class="intro__inner">
          <div class="intro__count">{{ countLabel() }}</div>
          <div class="intro__word serif">Grigoris</div>
          <div class="intro__bar">
            <i [style.left]="'0'"
               [style.right]="'auto'"
               [style.width]="'100%'"
               [style.transform]="'translateX(' + barOffset() + '%)'"></i>
          </div>
        </div>
      </div>
    }
  `,
})
export class IntroComponent {
  private readonly intro = inject(IntroService);
  private readonly motion = inject(MotionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly visible = signal(true);
  protected readonly done = signal(false);
  protected readonly count = signal(0);
  protected readonly countLabel = signal('00');
  protected readonly barOffset = signal(-100);

  private started = false;
  private readonly timers: ReturnType<typeof setTimeout>[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (!this.isBrowser) {
      this.visible.set(false);
      this.intro.reveal();
      return;
    }
    afterNextRender(() => this.schedule());
    this.destroyRef.onDestroy(() => {
      if (this.interval) {
        clearInterval(this.interval);
      }
      this.timers.forEach(clearTimeout);
    });
  }

  private schedule(): void {
    // Start once fonts settle, capped — never block on the full load event.
    const fonts = (this.document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      Promise.race([
        fonts.ready,
        new Promise<void>((r) => this.timers.push(setTimeout(r, 900))),
      ]).then(() => this.run());
    }
    this.timers.push(setTimeout(() => this.run(), 1100));
  }

  private run(): void {
    if (this.started) {
      return; // guard against double-run
    }
    this.started = true;

    if (!this.motion.motionEnabled()) {
      this.visible.set(false);
      this.intro.reveal();
      return;
    }

    let n = 0;
    this.interval = setInterval(() => {
      n += Math.floor(6 + Math.random() * 14);
      if (n >= 100) {
        n = 100;
        if (this.interval) {
          clearInterval(this.interval);
        }
        this.finish();
      }
      this.count.set(n);
      this.countLabel.set(String(n).padStart(2, '0'));
      this.barOffset.set(n - 100);
    }, 90);
  }

  private finish(): void {
    this.timers.push(
      setTimeout(() => {
        this.done.set(true);
        this.intro.reveal();
        this.timers.push(setTimeout(() => this.visible.set(false), 1000));
      }, 260),
    );
  }
}
