import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

interface NavLink {
  id: string;
  num: string;
  label: string;
  cta?: boolean;
}

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress" [style.width.%]="progress()"></div>

    <nav class="nav" [class.shrink]="shrink()" id="nav">
      <a class="nav__brand" href="#top">
        Grigoris Mitsis
        <span class="mono">GM&nbsp;·&nbsp;'26</span>
      </a>
      <div class="nav__links">
        @for (link of links; track link.id) {
          <a
            [href]="'#' + link.id"
            [class.cta]="link.cta"
            [class.active]="activeId() === link.id">
            <span class="num">{{ link.num }}</span>{{ link.label }}
          </a>
        }
      </div>
    </nav>
  `,
})
export class NavComponent {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly shrink = signal(false);
  protected readonly progress = signal(0);
  protected readonly activeId = signal<string>('');

  protected readonly links: NavLink[] = [
    { id: 'about', num: '01', label: 'About' },
    { id: 'skills', num: '02', label: 'Stack' },
    { id: 'experience', num: '03', label: 'Work' },
    { id: 'contact', num: '04', label: 'Contact', cta: true },
  ];

  constructor() {
    if (!this.isBrowser) {
      return;
    }
    afterNextRender(() => this.wire());
  }

  private wire(): void {
    const onScroll = () => {
      const st = window.scrollY || this.document.documentElement.scrollTop;
      this.shrink.set(st > 40);
      const h = this.document.documentElement.scrollHeight - window.innerHeight;
      this.progress.set(h > 0 ? (st / h) * 100 : 0);
    };
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', onScroll, { passive: true });
    });
    onScroll();

    // Active section — IntersectionObserver mirroring the prototype's margins.
    const sections = this.links
      .map((l) => this.document.getElementById(l.id))
      .filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            this.activeId.set(en.target.id);
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    });
  }
}
