import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <footer class="footer" id="contact">
      <div class="shell">
        <div class="footer__big r">
          Let's build
          <span class="serif ital accent">something</span>
          <a href="mailto:gmitsis@outlook.com">— get in touch</a>
        </div>
        <div class="footer__row">
          <span>© 2026 Grigoris Mitsis — Senior Frontend Engineer</span>
          <span>
            <a href="https://gr.linkedin.com/in/gmitsis" target="_blank" rel="noopener">LinkedIn</a>
            &nbsp;/&nbsp;
            <a href="#top">Back to top ↑</a>
          </span>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
