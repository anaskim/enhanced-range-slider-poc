# Native `<rangegroup>` Chromium prototype demo

This Astro site adapts Brecht De Ruyte's enhanced range slider proof of concept
to Chromium's experimental native `<rangegroup>` implementation. It is a
standards-design prototype, not a production-ready component or polyfill.

The page keeps the original examples and labels each one according to what the
current browser implementation provides:

- **Native**: the behavior is implemented by `<rangegroup>` and its descendant
  `<input type="range">` controls.
- **Native + gap**: the core control works, but a proposed styling or interaction
  surface is not implemented.
- **Author output**: JavaScript or CSS presents the native values outside the
  control.
- **Design question**: the example depends on an unresolved proposal area.

## Requirements

- Node.js 22
- pnpm
- A Chromium build containing the `RangeGroup` and `SliderPseudoElements`
  runtime features

The public GitHub Pages build cannot enable local Blink runtime flags. In a
normal browser, the page therefore shows an explicit fallback state and keeps
the real descendant range inputs visible and usable.

## Local development

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Astro normally serves the page at `http://localhost:4321/enhanced-range-slider-poc/`.

Launch the prototype Chromium build with:

```powershell
Q:\cr\src\out\release_x64\chrome.exe `
  --enable-blink-features=RangeGroup,SliderPseudoElements `
  http://localhost:4321/enhanced-range-slider-poc/
```

Build and check the static site with:

```powershell
pnpm exec prettier --check .
pnpm exec astro check
pnpm build
```

## Current prototype boundaries

The Chromium prototype supports real descendant range inputs, shared
constraints, disabledness, datalist ticks and pointer snapping, form behavior,
the JavaScript API, `::slider-track`, `::slider-segment`, `::slider-thumb`,
indexed `::slider-segment(n)` and `::slider-thumb(n)`, and wildcard
`::slider-thumb(*)` pseudo-elements.

The following proposal areas remain unresolved or unimplemented:

- public tick and tick-label styling;
- public whole-interval dragging and equivalent keyboard or assistive
  technology behavior;
- custom path hit testing and inverse pointer mapping;
- datalist keyboard snapping;
- mutation-time automatic constraint repair;
- multiple simultaneous touches;
- maximum or per-pair gaps, nonlinear scales, and vertical orientation.

See the [Open UI enhanced range input explainer](https://open-ui.org/components/enhanced-range-input.explainer/)
for the proposal context.

## Attribution

The layout, visual language, and original example set come from
[brechtDR/enhanced-range-slider-poc](https://github.com/brechtDR/enhanced-range-slider-poc).
This fork replaces the Lit custom element with the experimental native browser
implementation and documents the remaining implementation and design gaps.
