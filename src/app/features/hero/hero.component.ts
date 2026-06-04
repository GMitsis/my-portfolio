import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroCanvasComponent } from './hero-canvas.component';
import { HeroEditorialComponent } from './hero-editorial.component';
import { HeroMarqueeComponent } from './hero-marquee.component';

/**
 * Hero shell. All three directions are rendered; only the one matching
 * `body[data-hero]` is shown (handled in CSS), exactly like the prototype.
 * The active direction is chosen by ThemeService (default: editorial).
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroEditorialComponent, HeroMarqueeComponent, HeroCanvasComponent],
  template: `
    <app-hero-editorial />
    <app-hero-marquee />
    <app-hero-canvas />
  `,
})
export class HeroComponent {}
