import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';
import { IndustryEmblemComponent, Industry } from './industry-emblem.component';

interface Chip {
  label: string;
  solid?: boolean;
}

interface TimelineEntry {
  start: string;
  end: string;
  present?: boolean;
  company: string;
  role: string;
  industry: Industry;
  /** modifier class on `.tl-icon` that drives the hover animation */
  iconModifier: string;
  chips: Chip[];
}

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, IndustryEmblemComponent],
  template: `
    <section class="section" id="experience">
      <div class="shell">
        <div class="section-head">
          <span class="idx">03</span>
          <h2>Selected Experience</h2>
        </div>
        <div class="tl">
          @for (entry of entries; track entry.company) {
            <article class="tl-item r">
              <div class="tl-when">
                {{ entry.start }}<br />
                @if (entry.present) {
                  <span class="now">{{ entry.end }}</span>
                } @else {
                  {{ entry.end }}
                }
              </div>
              <div class="tl-main">
                <div class="co">{{ entry.company }}</div>
                <p class="role">{{ entry.role }}</p>
              </div>
              <div class="tl-tags">
                <div class="tl-icon" [class]="entry.iconModifier" aria-hidden="true">
                  <app-industry-emblem [industry]="entry.industry" />
                </div>
                @for (chip of entry.chips; track chip.label) {
                  <span class="chip" [class.solid]="chip.solid">{{ chip.label }}</span>
                }
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class ExperienceComponent {
  protected readonly entries: TimelineEntry[] = [
    {
      start: 'Feb 2026',
      end: 'Present',
      present: true,
      company: 'Tactical Edge Technologies',
      role: 'Senior Frontend Engineer — building mission-critical interfaces and operational tooling for defence systems.',
      industry: 'radar',
      iconModifier: 'tl-icon--radar',
      chips: [{ label: 'Defence', solid: true }],
    },
    {
      start: 'Feb 2021',
      end: 'Jan 2026',
      company: 'Vimachem',
      role: 'Senior Frontend Engineer — pharma manufacturing intelligence dashboards: dense, real-time, validated UIs.',
      industry: 'molecule',
      iconModifier: 'tl-icon--mol',
      chips: [{ label: 'Pharmaceutical' }],
    },
    {
      start: 'Jun 2017',
      end: 'Jan 2021',
      company: 'App-Art',
      role: 'Frontend Engineer — consumer & enterprise products, including telecom self-service for Vodafone.',
      industry: 'telecom',
      iconModifier: 'tl-icon--tele',
      chips: [{ label: 'Telecom' }, { label: 'Vodafone' }],
    },
    {
      start: 'Apr 2016',
      end: 'May 2017',
      company: 'Agile Actors',
      role: 'Frontend Engineer — digital banking platforms & secure transactional flows for Alpha Bank.',
      industry: 'bank',
      iconModifier: 'tl-icon--bank',
      chips: [{ label: 'Banking' }, { label: 'Alpha Bank' }],
    },
  ];
}
