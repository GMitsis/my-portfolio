# Grigoris Mitsis — Portfolio (Angular)

A single-page, dark, editorial personal portfolio for **Grigoris Mitsis**, Senior
Frontend Engineer. Implemented in **Angular 21** (standalone components, signals,
new `@if`/`@for` control flow, zoneless change detection) from the design handoff
in the parent folder. Motion-forward: intro curtain, masked headline reveal,
scroll reveals, parallax, infinite marquees, a cursor-reactive dot field, and an
animated flow-field background.

## Run

```bash
npm start            # ng serve  → http://localhost:4200/
npm run build        # production build → dist/portfolio/browser/
```

## Architecture

```
src/app/
  core/
    theme.service.ts        # signals for the theme (replaces the dev "Tweaks" panel);
                            # an effect() reflects them onto <body> as data-* attrs / --accent
    motion.service.ts       # motionEnabled = theme.motion() && !prefers-reduced-motion
    intro.service.ts        # coordinates the intro curtain with the hero reveal
  shared/
    reveal.directive.ts     # .r scroll reveals via one shared IntersectionObserver
    parallax.directive.ts   # [appParallax] — one shared rAF loop for all targets
    marquee.directive.ts    # [appMarquee] — seamless loop + scroll-velocity boost
  features/
    nav/                    # fixed nav: shrink, scroll progress bar, active section (IO)
    intro/                  # 00→100 counter curtain
    background-flow/        # fixed #bgflow canvas: curves | grid | none
    hero/                   # hero shell + hero-editorial | hero-marquee | hero-canvas
    about/  skills/  experience/  footer/
    experience/industry-emblem.component.ts  # inline monoline SVG emblems (radar/molecule/telecom/bank)
```

### Notes on the port
- **No Tweaks panel** (per handoff). Its default values live in `ThemeService`
  signals; each maps to a `data-*` attribute on `<body>` exactly as the prototype
  did, so the ported CSS works verbatim. A real settings UI could bind to these
  signals later.
- **Styles** are kept global in `src/styles.scss` (ported from `assets/styles.css`)
  because the design relies on `body[data-*]` theme selectors and shared element
  classes that span components.
- **Animation** is imperative DOM driven inside directives/components, every rAF
  loop wrapped in `NgZone.runOutsideAngular`, all listeners/observers/rAF cleaned
  up via `DestroyRef`. Browser APIs are guarded with `isPlatformBrowser`.
- All motion is gated behind `MotionService.motionEnabled()` (theme flag +
  `prefers-reduced-motion`).

## Deploy

Static (no SSR): deploy `dist/portfolio/browser/` to any static host with a SPA
fallback (`/* → /index.html`). Enable brotli/gzip, long-cache hashed assets. The
two active display fonts and the body/mono fonts load from Google Fonts (self-host
for production). SEO/OpenGraph meta + `<base href="/">` are set in `src/index.html`.
