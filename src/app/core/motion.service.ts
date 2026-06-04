import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject } from '@angular/core';
import { ThemeService } from './theme.service';

/**
 * Resolves whether animation should run: the theme `motion` flag AND the user
 * has not requested reduced motion. All animation code (directives, canvases)
 * reads `motionEnabled()` before doing work.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly theme = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** True once if the OS-level "reduce motion" setting is on. */
  private readonly prefersReducedMotion =
    this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  readonly motionEnabled = computed(() => this.theme.motion() && !this.prefersReducedMotion);
}
