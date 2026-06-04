import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { MotionService } from '../../core/motion.service';
import { ThemeService } from '../../core/theme.service';

interface Dot {
  x: number;
  y: number;
  ox: number;
  oy: number;
}

/**
 * Hero C — Canvas (interactive). A dot matrix (~38px gap) whose dots near the
 * cursor brighten to accent, scale up and push radially outward; a soft accent
 * glow follows the cursor; the centred name is magnetic toward the cursor.
 * The rAF loop only runs while this hero is active AND motion is on.
 */
@Component({
  selector: 'app-hero-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="hero" id="hero-canvas" #hero>
      <canvas id="dotfield" #canvas></canvas>
      <div class="hc-glow" #glow></div>
      <div class="hc-inner">
        <div class="hc-eyebrow eyebrow">
          <span class="dot"></span>Senior Frontend Engineer · Est. 2016
        </div>
        <h1 class="hc-name" #name>
          <span class="ln">Grigoris</span>
          <span class="ln accent ital">Mitsis</span>
        </h1>
        <p class="hc-tag">Interfaces engineered with intent.</p>
      </div>
      <div class="hero__foot">
        <div class="scroll-cue"><span class="line"></span><span>Move cursor · Scroll</span></div>
        <span class="idx">Interactive</span>
      </div>
    </header>
  `,
})
export class HeroCanvasComponent {
  private readonly theme = inject(ThemeService);
  private readonly motion = inject(MotionService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly heroRef = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly glowRef = viewChild.required<ElementRef<HTMLElement>>('glow');
  private readonly nameRef = viewChild.required<ElementRef<HTMLElement>>('name');

  private ctx: CanvasRenderingContext2D | null = null;
  private dots: Dot[] = [];
  private cw = 0;
  private ch = 0;
  private readonly dpr = this.isBrowser ? Math.min(2, window.devicePixelRatio || 1) : 1;
  private readonly mouse = { x: -9999, y: -9999 };
  private raf = 0;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    // Start/stop the field when the active hero or motion flag changes.
    effect(() => {
      const active = this.theme.heroDirection() === 'canvas' && this.motion.motionEnabled();
      if (active) {
        this.start();
      } else {
        this.stop();
      }
    });

    afterNextRender(() => {
      this.ctx = this.canvasRef().nativeElement.getContext('2d');
      const hero = this.heroRef().nativeElement;

      const onMove = (e: MouseEvent) => {
        const r = hero.getBoundingClientRect();
        this.mouse.x = e.clientX - r.left;
        this.mouse.y = e.clientY - r.top;
        const glow = this.glowRef().nativeElement;
        glow.style.left = `${this.mouse.x}px`;
        glow.style.top = `${this.mouse.y}px`;
        if (this.motion.motionEnabled()) {
          const mx = (e.clientX - r.left - r.width / 2) / r.width;
          const my = (e.clientY - r.top - r.height / 2) / r.height;
          this.nameRef().nativeElement.style.transform =
            `translate3d(${mx * 26}px, ${my * 18}px, 0)`;
        }
      };
      const onLeave = () => {
        this.mouse.x = -9999;
        this.mouse.y = -9999;
        this.nameRef().nativeElement.style.transform = '';
      };
      const onResize = () => {
        if (this.raf) {
          this.buildDots();
        }
      };

      this.zone.runOutsideAngular(() => {
        hero.addEventListener('mousemove', onMove);
        hero.addEventListener('mouseleave', onLeave);
        window.addEventListener('resize', onResize);
      });

      this.destroyRef.onDestroy(() => {
        hero.removeEventListener('mousemove', onMove);
        hero.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('resize', onResize);
        this.stop();
      });

      // Kick off if this hero is already the active one.
      if (this.theme.heroDirection() === 'canvas' && this.motion.motionEnabled()) {
        this.start();
      }
    });
  }

  private buildDots(): void {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.cw = rect.width;
    this.ch = rect.height;
    canvas.width = this.cw * this.dpr;
    canvas.height = this.ch * this.dpr;
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.dots = [];
    const gap = 38;
    for (let y = gap; y < this.ch; y += gap) {
      for (let x = gap; x < this.cw; x += gap) {
        this.dots.push({ x, y, ox: x, oy: y });
      }
    }
  }

  private start(): void {
    if (!this.ctx || this.raf) {
      return;
    }
    this.buildDots();
    this.zone.runOutsideAngular(() => {
      this.raf = requestAnimationFrame(this.drawDots);
    });
  }

  private stop(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private drawDots = (): void => {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, this.cw, this.ch);
    const ac = this.theme.accent();
    for (const d of this.dots) {
      const dx = d.ox - this.mouse.x;
      const dy = d.oy - this.mouse.y;
      const dist = Math.hypot(dx, dy);
      const R = 140;
      let r = 1.1;
      let near = 0;
      if (dist < R) {
        near = 1 - dist / R;
        const push = near * 14;
        const ang = Math.atan2(dy, dx);
        d.x = d.ox + Math.cos(ang) * push;
        d.y = d.oy + Math.sin(ang) * push;
        r = 1.1 + near * 2.6;
      } else {
        d.x += (d.ox - d.x) * 0.12;
        d.y += (d.oy - d.y) * 0.12;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      if (near > 0.05) {
        ctx.fillStyle = ac;
        ctx.globalAlpha = 0.25 + near * 0.75;
      } else {
        ctx.fillStyle = '#3a3c33';
        ctx.globalAlpha = 0.55;
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(this.drawDots);
  };
}
