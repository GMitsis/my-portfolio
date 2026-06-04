import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type Industry = 'radar' | 'molecule' | 'telecom' | 'bank';

/**
 * Thin monoline industry emblems (56px, viewBox 0 0 64 64, stroke-width 1.6).
 * Root stroke is `currentColor` (driven muted→accent by the timeline row hover);
 * always-accent details use `var(--accent)` directly. Rotating/pulsing groups
 * are animated purely in CSS (see styles.scss, gated by the motion flag).
 * Decorative only — marked aria-hidden.
 */
@Component({
  selector: 'app-industry-emblem',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (industry()) {
      @case ('radar') {
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="32" cy="32" r="22" />
          <circle cx="32" cy="32" r="12.5" />
          <line x1="32" y1="8" x2="32" y2="56" />
          <line x1="8" y1="32" x2="56" y2="32" />
          <path class="sweep" d="M32 32 L32 10 A22 22 0 0 1 50.5 21 Z"
                fill="var(--accent)" fill-opacity="0.16" stroke="var(--accent)" />
          <path d="M43 19 l3.2 5.4 l-6.4 0 z" fill="var(--accent)" stroke="none" />
          <rect x="20.5" y="39.5" width="4.5" height="4.5" fill="var(--accent)" stroke="none" />
          <circle cx="44" cy="43" r="1.9" fill="currentColor" stroke="none" />
        </svg>
      }
      @case ('molecule') {
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <g class="mol">
            <line x1="32" y1="32" x2="18" y2="20" />
            <line x1="32" y1="32" x2="47" y2="22" />
            <line x1="32" y1="32" x2="23" y2="47" />
            <line x1="32" y1="32" x2="45" y2="45" />
            <circle cx="32" cy="32" r="5" />
            <circle cx="18" cy="20" r="3.4" />
            <circle cx="47" cy="22" r="3.4" />
            <circle cx="23" cy="47" r="3.4" />
            <circle cx="45" cy="45" r="4.2" fill="var(--accent)" stroke="none" />
          </g>
        </svg>
      }
      @case ('telecom') {
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="32" y1="42" x2="32" y2="22" />
          <path d="M24 52 L32 40 L40 52" />
          <g class="waves" stroke="var(--accent)">
            <path d="M23 23 a13 13 0 0 1 18 0" />
            <path d="M18 18 a20 20 0 0 1 28 0" />
          </g>
          <circle cx="32" cy="42" r="3.2" fill="var(--accent)" stroke="none" />
        </svg>
      }
      @case ('bank') {
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 23 L32 9 L57 23" />
          <line x1="10" y1="23" x2="54" y2="23" />
          <line x1="15" y1="28" x2="15" y2="49" />
          <line x1="26" y1="28" x2="26" y2="49" />
          <line x1="38" y1="28" x2="38" y2="49" />
          <line x1="49" y1="28" x2="49" y2="49" />
          <line x1="9" y1="53" x2="55" y2="53" />
          <circle cx="32" cy="27" r="1.8" fill="var(--accent)" stroke="none" />
        </svg>
      }
    }
  `,
})
export class IndustryEmblemComponent {
  readonly industry = input.required<Industry>();
}
