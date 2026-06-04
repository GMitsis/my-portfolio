import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section class="section" id="about">
      <div class="shell">
        <div class="section-head">
          <span class="idx">01</span>
          <h2>About</h2>
        </div>
        <div class="about-grid">
          <aside class="about-aside r">
            <div><span class="k">Discipline</span><br />Frontend Engineering</div>
            <br />
            <div>
              <span class="k">Focus</span><br />UI architecture, performance, design systems
            </div>
            <br />
            <div><span class="k">Based</span><br />Athens, Greece</div>
          </aside>
          <div class="about-statement r">
            I'm a frontend engineer with
            <em>ten years</em> shipping production interfaces across highly-regulated,
            high-stakes domains. <span class="dim">I care about the details users never
            notice —</span> the 60fps interaction, the keyboard path, the empty state,
            the bundle that loads before they blink.
          </div>
        </div>
        <div class="about-foot">
          <div class="stat r"><div class="n">10</div><div class="l">Years shipping</div></div>
          <div class="stat r"><div class="n">04</div><div class="l">Industries</div></div>
          <div class="stat r"><div class="n">∞</div><div class="l">Pixels argued over</div></div>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent {}
