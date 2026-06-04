import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from './core/theme.service';
import { AboutComponent } from './features/about/about.component';
import { BackgroundFlowComponent } from './features/background-flow/background-flow.component';
import { ExperienceComponent } from './features/experience/experience.component';
import { FooterComponent } from './features/footer/footer.component';
import { HeroComponent } from './features/hero/hero.component';
import { IntroComponent } from './features/intro/intro.component';
import { NavComponent } from './features/nav/nav.component';
import { SkillsComponent } from './features/skills/skills.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BackgroundFlowComponent,
    IntroComponent,
    NavComponent,
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    ExperienceComponent,
    FooterComponent,
  ],
  template: `
    <app-background-flow />
    <app-intro />
    <app-nav />

    <main id="top">
      <app-hero />
      <app-about />
      <app-skills />
      <app-experience />
      <app-footer />
    </main>
  `,
})
export class App {
  // Eagerly construct ThemeService so its body[data-*] reflection effect runs.
  private readonly theme = inject(ThemeService);
}
