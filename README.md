# Native `<rangegroup>` Chromium prototype demo

This Astro site adapts Brecht De Ruyte's enhanced range slider proof of concept
to Chromium's experimental native `<rangegroup>` implementation. It is a
standards-design prototype, not a production-ready component or polyfill.

The page keeps the original examples and uses disclosure boxes to separate
prototype implementation notes from unresolved Open UI design questions.

## Requirements

- Node.js 22
- pnpm
- A Chromium build containing the `RangeGroup`, `RangeGroupConvenienceAPI`,
  `RangeGroupSegmentDragging`, and `SliderPseudoElements` runtime features

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
  --enable-blink-features=RangeGroup,RangeGroupConvenienceAPI,RangeGroupSegmentDragging,SliderPseudoElements `
  http://localhost:4321/enhanced-range-slider-poc/
```

The runtime badge detects the core element, convenience API, and slider
pseudos independently. Segment dragging has no script-visible detection
surface, so examples that use it require the launch flag above.

Build and check the static site with:

```powershell
pnpm exec prettier --check .
pnpm exec astro check
pnpm build
```

## Current prototype boundaries

The Chromium prototype supports real descendant range inputs, shared
constraints, effective group disabledness, datalist ticks and pointer snapping,
form behavior, the separately gated JavaScript API and segment dragging
experiment, `::slider-track`, `::slider-segment`, `::slider-thumb`, indexed
`::slider-segment(n)` and `::slider-thumb(n)`, and wildcard
`::slider-thumb(*)` pseudo-elements. Participating inputs retain their host
layout and semantics while their standalone internal slider painting is
suppressed.

The following proposal areas remain unresolved or unimplemented:

- public tick and tick-label styling;
- a public opt-in and keyboard or assistive technology equivalent for
  whole-interval dragging;
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
