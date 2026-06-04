import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MarqueeDirective } from '../../shared/marquee.directive';

/**
 * Hero B — Marquee. Two full-bleed infinite marquees scrolling in opposite
 * directions (outlined name row + filled "Frontend Engineer" row), plus a
 * serif lead and a mono industries column.
 */
@Component({
  selector: 'app-hero-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MarqueeDirective],
  template: `
    <header class="hero" id="hero-marquee">
      <div class="shell">
        <div class="he-eyebrow" style="margin-bottom:0; padding-top:12vh;">
          <span class="eyebrow"><span class="dot"></span>Senior Frontend Engineer</span>
          <span class="idx">10 yrs · Athens, GR</span>
        </div>
      </div>
      <div class="mq mq--out" style="margin-top:4vh;">
        <div class="mq__track" [appMarquee]="1" [speed]="0.6">
          <span>Grigoris Mitsis</span><span class="mq__dot">✦</span>
          <span>Grigoris Mitsis</span><span class="mq__dot">✦</span>
          <span>Grigoris Mitsis</span><span class="mq__dot">✦</span>
        </div>
      </div>
      <div class="mq mq--fill">
        <div class="mq__track" [appMarquee]="-1" [speed]="0.6">
          <span>Frontend</span><span>Engineer</span><span>Frontend</span><span>Engineer</span>
          <span>Frontend</span><span>Engineer</span>
        </div>
      </div>
      <div class="shell">
        <div class="mq-meta">
          <p class="lead">
            Crafting <em>fast, accessible</em> interfaces for banking, telecom, pharma &amp; defence.
          </p>
          <div class="right">
            BANKING — TELECOM<br />PHARMA — DEFENCE<br />
            <span style="color:var(--faint)">— scroll to begin —</span>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeroMarqueeComponent {}
