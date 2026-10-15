# Native `<rangegroup>` Chromium prototype demo

This Astro site adapts Brecht De Ruyte's enhanced range slider proof of concept
to Chromium's experimental native `<rangegroup>` implementation. It is a
standards-design prototype, not a production-ready component or polyfill.

The page keeps the original examples and uses disclosure boxes to separate
prototype implementation notes from unresolved Open UI design questions.

## Requirements

- Node.js 22
- pnpm
- A Chromium build containing the `RangeGroup`,
  `RangeGroupConvenienceAPI`, `RangeGroupDatalistKeyboardNavigation`,
  `RangeGroupSegmentDragging`, and `SliderPseudoElements` runtime features

The authored anchored-label example additionally requires the optional
`RangeGroupAnchoredLabels` runtime feature.

The public GitHub Pages build cannot enable local Blink runtime flags. In a
normal browser, the page therefore shows an explicit fallback state and keeps
the real descendant range inputs visible and usable.

## Local development

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Astro normally serves the page at `http://localhost:4321/enhanced-range-slider-poc/`.

Launch only the semantic MVP with:

```powershell
Q:\cr\src\out\release_x64\chrome.exe `
  --enable-blink-features=RangeGroup `
  http://localhost:4321/enhanced-range-slider-poc/
```

Launch the relationship-only anchored-label experiment with:

```powershell
Q:\cr\src\out\release_x64\chrome.exe `
  --enable-blink-features=RangeGroup,RangeGroupAnchoredLabels `
  "http://localhost:4321/enhanced-range-slider-poc/?rangegroup-anchored-labels=on"
```

This mode only supplies an implicit relationship between each associated label
and its thumb. It does not position labels, and it does not require
`SliderPseudoElements`.

Launch the broader authored showcase with:

```powershell
Q:\cr\src\out\release_x64\chrome.exe `
  --enable-blink-features=RangeGroup,RangeGroupConvenienceAPI,RangeGroupDatalistKeyboardNavigation,RangeGroupSegmentDragging,SliderPseudoElements `
  http://localhost:4321/enhanced-range-slider-poc/
```

The runtime badge detects the core element, convenience API, and slider
pseudos independently. Anchored-label relationships, datalist keyboard
navigation, and segment dragging have no script-visible detection surface, so
the badge reports them as separate launch flags.

Build and check the static site with:

```powershell
corepack pnpm exec prettier --check .
corepack pnpm exec astro check
corepack pnpm build
```

## Current prototype boundaries

The Chromium prototype supports real descendant range inputs, shared
constraints, effective group disabledness, datalist ticks and pointer snapping,
form behavior, the separately gated JavaScript API, datalist keyboard
navigation, segment dragging experiment, `::slider-track`, `::slider-segment`,
`::slider-thumb`, indexed
`::slider-segment(n)` and `::slider-thumb(n)`, and wildcard
`::slider-thumb(*)` pseudo-elements. Participating inputs retain their host
layout and semantics while their standalone internal slider painting is
suppressed. Inherited horizontal and vertical writing modes share logical
proxy geometry, keyboard focus is indicated on the visible proxy thumb,
browser focus reveal follows that proxy while respecting `preventScroll`, and
the single-active-pointer model preserves browser pinch zoom.

Value pills in the authored tooltip examples are ordinary DOM elements
positioned with CSS Anchor Positioning and updated with author JavaScript.
Separately, `RangeGroupAnchoredLabels` gives real associated labels an implicit
relationship to their thumbs. Authors must still opt into visible placement
with CSS; Chromium does not apply automatic label positioning.

The following proposal areas remain unresolved or unimplemented:

- public tick and tick-label styling;
- a public opt-in and keyboard or assistive technology equivalent for
  whole-interval dragging;
- custom path hit testing and inverse pointer mapping;
- mutation-time automatic constraint repair;
- multiple simultaneous touches;
- maximum or per-pair gaps, nonlinear scales, a dedicated orientation API, and
  deliberately different group and child writing modes.

See the [Open UI enhanced range input explainer](https://open-ui.org/components/enhanced-range-input.explainer/)
for the proposal context.

## Attribution

The layout, visual language, and original example set come from
[brechtDR/enhanced-range-slider-poc](https://github.com/brechtDR/enhanced-range-slider-poc).
This fork replaces the Lit custom element with the experimental native browser
implementation and documents the remaining implementation and design gaps.
