import { Injectable, signal } from '@angular/core';

/**
 * Coordinates the intro curtain with the hero entrance. The intro component
 * flips `revealed` to true when the counter finishes (or immediately when motion
 * is off); the editorial hero watches it to lift its masked headline.
 */
@Injectable({ providedIn: 'root' })
export class IntroService {
  readonly revealed = signal(false);

  reveal(): void {
    this.revealed.set(true);
  }
}
