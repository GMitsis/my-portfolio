import { DOCUMENT } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type HeroDirection = 'editorial' | 'marquee' | 'canvas';
export type DisplayFont = 'bodoni' | 'dmserif' | 'instrument';
export type BackgroundFX = 'curves' | 'grid' | 'none';

/** Selectable accent family — all share the same chartreuse vibe. */
export const ACCENTS = ['#cdfc4f', '#b4ff3a', '#e6ff52', '#9af23c'] as const;

/**
 * Single source of truth for the theme. Replaces the prototype's dev-only
 * "Tweaks" panel: the defaults below are taken verbatim from tweaks.js, and an
 * `effect()` reflects each signal onto <body> as a `data-*` attribute (or sets
 * `--accent`) exactly like the prototype did — so the ported CSS works as-is.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly heroDirection = signal<HeroDirection>('editorial');
  readonly displayFont = signal<DisplayFont>('bodoni');
  readonly backgroundFX = signal<BackgroundFX>('curves');
  readonly accent = signal<string>('#cdfc4f');
  readonly tagline = signal<string>('interfaces, experiences, systems, interactions');
  readonly motion = signal<boolean>(true);
  readonly grain = signal<boolean>(true);

  constructor() {
    // Reflect theme state onto <body> / :root, guarded for SSR.
    effect(() => {
      if (!this.isBrowser) {
        return;
      }
      const body = this.document.body;
      const root = this.document.documentElement;
      body.setAttribute('data-hero', this.heroDirection());
      body.setAttribute('data-font', this.displayFont());
      body.setAttribute('data-bg', this.backgroundFX());
      body.setAttribute('data-motion', this.motion() ? 'on' : 'off');
      body.setAttribute('data-grain', this.grain() ? 'on' : 'off');
      root.style.setProperty('--accent', this.accent());
    });
  }
}
