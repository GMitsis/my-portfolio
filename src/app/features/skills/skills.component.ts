import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MarqueeDirective } from '../../shared/marquee.directive';
import { RevealDirective } from '../../shared/reveal.directive';

interface SkillRow {
  category: string;
  /** Items as HTML-safe parts; each is wrapped in <b> and brightens on hover. */
  items: string[];
  level: string;
}

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MarqueeDirective, RevealDirective],
  template: `
    <section class="section" id="skills">
      <div class="shell">
        <div class="section-head">
          <span class="idx">02</span>
          <h2>Stack &amp; Craft</h2>
        </div>
        <div class="skill-rows">
          @for (row of rows; track row.category) {
            <div class="skill-row r">
              <div class="cat">{{ row.category }}</div>
              <div class="items">
                @for (item of row.items; track item; let last = $last) {
                  <b>{{ item }}</b>@if (!last) {<span>, </span>}
                }
              </div>
              <div class="lvl">{{ row.level }}</div>
            </div>
          }
        </div>
        <div class="tech-strip">
          <div class="mq__track" [appMarquee]="-1" [speed]="0.4">
            @for (tech of techStrip; track $index) {
              <span>{{ tech }}</span>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class SkillsComponent {
  protected readonly rows: SkillRow[] = [
    { category: 'Framework', items: ['Angular 2+'], level: 'Core' },
    {
      category: 'Languages',
      items: ['TypeScript', 'JavaScript', 'HTML', 'CSS / Sass'],
      level: 'Daily',
    },
    { category: 'State & Streams', items: ['NgRx', 'RxJS'], level: 'Signature' },
    {
      category: 'UI & Styling',
      items: ['PrimeNG', 'Tailwind CSS', 'Bootstrap', 'Figma'],
      level: 'Daily',
    },
    {
      category: 'Craft',
      items: ['Design Systems', 'Accessibility', 'Performance'],
      level: 'Signature',
    },
  ];

  // Single set; MarqueeDirective duplicates it for a seamless loop.
  protected readonly techStrip: string[] = [
    'Angular 2+',
    'TypeScript',
    'RxJS',
    'NgRx',
    'PrimeNG',
    'Tailwind CSS',
    'Bootstrap',
    'JavaScript',
    'Sass',
    'Jasmine',
    'Cypress',
    'Figma',
  ];
}
