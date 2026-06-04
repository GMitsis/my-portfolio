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

/**
 * Fixed full-viewport canvas drawn behind content (z-index 0).
 *  - `curves`: ~20 stacked 2-harmonic sine waves, phase animated over time;
 *    every 5th line is accent and slightly thicker.
 *  - `grid`: a faint static 64px grid.
 *  - `none`: cleared (and hidden via CSS).
 * Draws a single static frame when motion is off. rAF runs outside Angular.
 */
@Component({
  selector: 'app-background-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas id="bgflow" #canvas></canvas>`,
})
export class BackgroundFlowComponent {
  private readonly theme = inject(ThemeService);
  private readonly motion = inject(MotionService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private ctx: CanvasRenderingContext2D | null = null;
  private bw = 0;
  private bh = 0;
  private raf = 0;
  private t0 = 0;
  private readonly dpr = this.isBrowser ? Math.min(2, window.devicePixelRatio || 1) : 1;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    // React to theme/motion changes (backgroundFX, accent, motion). Runs before
    // the canvas exists (no-op while ctx is null), then on every later change.
    effect(() => {
      // Track dependencies:
      this.theme.backgroundFX();
      this.theme.accent();
      this.motion.motionEnabled();
      this.sync();
    });

    afterNextRender(() => {
      const canvas = this.canvasRef().nativeElement;
      this.ctx = canvas.getContext('2d');
      this.t0 = performance.now();

      const onResize = () => {
        this.resize();
        const fx = this.theme.backgroundFX();
        if (fx === 'grid') {
          this.drawGrid();
        } else if (fx === 'curves' && !this.motion.motionEnabled()) {
          this.drawFlow(performance.now());
        }
      };
      window.addEventListener('resize', onResize);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', onResize);
        this.stop();
      });

      this.sync(); // initial paint now that the canvas exists
    });
  }

  private resize(): void {
    const canvas = this.canvasRef().nativeElement;
    this.bw = window.innerWidth;
    this.bh = window.innerHeight;
    canvas.width = this.bw * this.dpr;
    canvas.height = this.bh * this.dpr;
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private sync(): void {
    if (!this.ctx) {
      return;
    }
    this.stop();
    this.resize();
    const fx = this.theme.backgroundFX();
    if (fx === 'none') {
      this.ctx.clearRect(0, 0, this.bw, this.bh);
      return;
    }
    if (fx === 'grid') {
      this.drawGrid();
      return;
    }
    // curves
    if (this.motion.motionEnabled()) {
      this.zone.runOutsideAngular(() => {
        this.raf = requestAnimationFrame((now) => this.drawFlow(now));
      });
    } else {
      this.t0 = performance.now();
      this.drawFlow(performance.now());
      this.stop();
    }
  }

  private drawFlow = (now: number): void => {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    const t = (now - this.t0) / 1000;
    ctx.clearRect(0, 0, this.bw, this.bh);
    const ac = this.theme.accent();
    const accentStroke = hexToRgba(ac, 0.34);
    const N = 20;
    for (let i = 0; i < N; i++) {
      const p = i / (N - 1);
      const baseY = this.bh * 0.08 + p * this.bh * 0.86;
      const amp = 24 + 20 * Math.sin(i * 0.6 + 1);
      const isAccent = i % 5 === 2;
      ctx.beginPath();
      for (let x = 0; x <= this.bw + 16; x += 16) {
        const y =
          baseY +
          amp * Math.sin(x * 0.004 + t * 0.22 + i * 0.55) +
          amp * 0.45 * Math.sin(x * 0.0021 - t * 0.16 + i * 0.9);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineWidth = isAccent ? 1.4 : 1.1;
      ctx.strokeStyle = isAccent ? accentStroke : 'rgba(242,241,234,0.11)';
      ctx.stroke();
    }
    this.raf = requestAnimationFrame(this.drawFlow);
  };

  private drawGrid(): void {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, this.bw, this.bh);
    ctx.strokeStyle = 'rgba(242,241,234,0.07)';
    ctx.lineWidth = 1;
    const gap = 64;
    for (let x = gap; x < this.bw; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.bh);
      ctx.stroke();
    }
    for (let y = gap; y < this.bh; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.bw, y);
      ctx.stroke();
    }
  }

  private stop(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }
}

/** #rgb / #rrggbb → rgba() string. */
function hexToRgba(hex: string, a: number): string {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = parseInt(x, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
