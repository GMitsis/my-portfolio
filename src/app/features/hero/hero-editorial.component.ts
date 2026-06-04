import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { IntroService } from '../../core/intro.service';
import { MotionService } from '../../core/motion.service';
import { ThemeService } from '../../core/theme.service';
import { ParallaxDirective } from '../../shared/parallax.directive';

/**
 * Hero A — Editorial (default). Masked two-line name that rises from
 * translateY(110%) on reveal (staggered), a serif tagline with a word rotator
 * cycling in accent italic, faint grid hairlines and a parallaxing outline "01".
 */
@Component({
  selector: 'app-hero-editorial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective],
  template: `
    <header class="hero" id="hero-editorial">
      <div class="grid-lines">
        @for (line of gridLines; track line) {
          <i [style.left.%]="line"></i>
        }
      </div>
      <div class="bigindex" [appParallax]="0.12">01</div>
      <div class="shell hero__inner" data-hero-lift>
        <div class="he-eyebrow">
          <span class="eyebrow"><span class="dot"></span>Senior Frontend Engineer</span>
          <span class="idx">Athens, GR — Est. 2016</span>
        </div>
        <h1 class="he-name" [appParallax]="0.04" #name>
          <span class="reveal-mask"><span>Grigoris</span></span>
          <span class="reveal-mask"><span class="sub">Mitsis</span></span>
        </h1>
        <p class="he-tag">
          A decade turning intricate product requirements into interfaces that feel
          effortless — I build
          <span class="rotator" [attr.aria-label]="firstWord()">
            <span class="rotator__item" #rotItem></span>
          </span>
        </p>
      </div>
      <div class="hero__foot">
        <div class="scroll-cue"><span class="line"></span><span>Scroll</span></div>
        <span class="idx">Angular · TypeScript · RxJS</span>
      </div>
    </header>
  `,
})
export class HeroEditorialComponent {
  private readonly intro = inject(IntroService);
  private readonly motion = inject(MotionService);
  private readonly theme = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly nameRef = viewChild.required<ElementRef<HTMLElement>>('name');
  private readonly rotItemRef = viewChild<ElementRef<HTMLElement>>('rotItem');

  protected readonly gridLines = [16.6, 33.2, 49.8, 66.4, 83];

  /** First rotator word, also drives the static fallback when motion is off. */
  protected readonly firstWord = signal('interfaces');

  private maskKids: HTMLElement[] = [];
  private rotTimer: ReturnType<typeof setInterval> | null = null;
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    this.firstWord.set(this.words()[0] ?? 'interfaces');

    if (!this.isBrowser) {
      return;
    }

    // Lift the masked headline when the intro reveals.
    effect(() => {
      if (this.intro.revealed()) {
        this.liftHero();
      }
    });

    // Rebuild the rotator when the tagline or motion changes.
    effect(() => {
      this.theme.tagline();
      this.motion.motionEnabled();
      this.buildRotator();
    });

    afterNextRender(() => {
      this.maskKids = Array.from(
        this.nameRef().nativeElement.querySelectorAll<HTMLElement>('.reveal-mask > *'),
      );
      this.armMasks();
      if (this.intro.revealed()) {
        this.liftHero();
      }
      this.scheduleSafetyNet();
    });

    this.destroyRef.onDestroy(() => {
      if (this.rotTimer) {
        clearInterval(this.rotTimer);
      }
      this.timers.forEach(clearTimeout);
    });
  }

  private words(): string[] {
    return this.theme
      .tagline()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // --- masked headline ------------------------------------------------------
  private armMasks(): void {
    if (!this.motion.motionEnabled()) {
      return;
    }
    for (const el of this.maskKids) {
      el.style.transition = 'none';
      el.style.transform = 'translateY(110%)';
    }
    void document.body.offsetWidth; // commit
  }

  private liftHero(): void {
    this.maskKids.forEach((el, i) => {
      el.style.transition = 'transform 1s cubic-bezier(0.22,1,0.36,1)';
      el.style.transitionDelay = `${i * 120}ms`;
      el.style.transform = 'translateY(0)';
    });
  }

  /** Guarantee the name is visible even if a composited transition stalls. */
  private scheduleSafetyNet(): void {
    this.timers.push(
      setTimeout(() => {
        for (const el of this.maskKids) {
          const m = getComputedStyle(el).transform;
          if (m && m !== 'none' && Math.abs(parseFloat(m.split(',')[5] ?? '0') || 0) > 2) {
            el.style.transition = 'none';
            el.style.transform = 'none';
          }
        }
      }, 3400),
    );
  }

  // --- rotator --------------------------------------------------------------
  private buildRotator(): void {
    const item = this.rotItemRef()?.nativeElement;
    if (!item) {
      return; // view not ready yet
    }
    if (this.rotTimer) {
      clearInterval(this.rotTimer);
      this.rotTimer = null;
    }
    const words = this.words();
    const ease = 'transform .5s cubic-bezier(.22,1,.36,1), opacity .45s';
    item.textContent = `${words[0] ?? ''}.`;
    item.style.display = 'inline-block';
    item.style.transition = ease;

    if (words.length < 2 || !this.motion.motionEnabled()) {
      return;
    }
    let i = 0;
    this.rotTimer = setInterval(() => {
      item.style.transform = 'translateY(-70%) rotate(-3deg)';
      item.style.opacity = '0';
      this.timers.push(
        setTimeout(() => {
          i = (i + 1) % words.length;
          item.textContent = `${words[i]}.`;
          item.style.transition = 'none';
          item.style.transform = 'translateY(70%) rotate(3deg)';
          void item.offsetWidth;
          item.style.transition = ease;
          item.style.transform = 'translateY(0) rotate(0)';
          item.style.opacity = '1';
        }, 480),
      );
    }, 2400);
  }
}
