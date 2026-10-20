# Design QA — MEDYNA public homepage dark editorial redesign

## Evidence

- Source visual truth:
  - `/home/ubuntu/Pictures/Imagen de Codex 18 ago 2026, 06_03_08 a.m..png`
  - `/home/ubuntu/Pictures/Imagen de Codex 18 ago 2026, 06_02_44 a.m..png`
- Implementation evidence:
  - `/home/ubuntu/Chat GPT Descargas/Medyna Work/medyna-public-site/implementation-hero-final.png`
  - `/home/ubuntu/Chat GPT Descargas/Medyna Work/medyna-public-site/implementation-architecture.png`
  - `/home/ubuntu/Chat GPT Descargas/Medyna Work/medyna-public-site/implementation-principles.png`
  - `/home/ubuntu/Chat GPT Descargas/Medyna Work/medyna-public-site/implementation-mobile.png`
- Viewport: desktop comparison requested at 1364 x 768 CSS px; mobile verification requested at 390 x 844 CSS px.
- Source pixels: 1364 x 768 for both supplied references.
- Implementation hero pixels: 1364 x 768. Density was normalized by comparing equal-size raster evidence and excluding source browser/desktop chrome from the design judgment.
- State: public homepage, dark theme, initial hero and anchor-navigation target sections.

## Full-view comparison evidence

The implementation preserves the reference direction: true-black canvas, full-bleed monochrome human photography, oversized white editorial headline, sparse navigation, generous negative space, and minimal interface decoration. It intentionally uses MEDYNA's current strategic copy rather than cloning the Squarespace wording. The former technical HUD/orbit illustration is absent.

## Focused-region comparison evidence

A separate crop was not required because the hero typography, navigation, image crop, CTA, and contrast are all clearly readable in the equal-size 1364 x 768 comparison. Architecture, principles, and mobile states were captured separately to validate the sections that do not exist in the supplied reference.

## Required fidelity surfaces

- Fonts and typography: Apple system-font stack with SF Pro names and native platform fallbacks; large optical display weight, tight tracking, and compact small text match the requested Apple direction.
- Spacing and layout rhythm: full-height hero, restrained header, large editorial sections, thin dividers, and generous black negative space follow the reference rhythm.
- Colors and tokens: black `#000`, near-black surfaces, white `#f5f5f7`, neutral gray secondary text, and subtle white hairlines. No bright former palette remains.
- Image quality and asset fidelity: two original high-resolution photographic assets are full-bleed, sharp, correctly cropped, and share the monochrome sculptural art direction of the references. No HUD, placeholder, CSS drawing, or fake icon replaces the requested imagery.
- Copy and content: MEDYNA's purpose, five pillars, fields, principles, and alliance position remain intact. Future capability is not presented as current fact.

## Interaction and runtime checks

- `Conocer MEDYNA` navigates to `#arquitectura`.
- Header navigation reaches architecture, scope, principles, and alliances.
- Desktop and mobile layouts render without blocking overflow after the mobile correction.
- Browser console: no warnings or errors in the checked states.

## Comparison history

### Iteration 1

- Finding: P2 — the desktop hero headline wrapped into three lines and weakened the reference's broad editorial composition.
- Fix: increased the hero copy measure and reduced the responsive display size.
- Post-fix evidence: `implementation-hero-final.png` shows a controlled two-line headline with the photograph remaining dominant.

### Iteration 2

- Finding: P2 — the initial mobile display size produced horizontal overflow.
- Fix: reduced the mobile headline to 54 px and constrained horizontal overflow at the document and body level.
- Post-fix evidence: the retest reported document scroll width below viewport width and the revised mobile screenshot keeps the complete headline visible.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- Mobile follow-up: same-page navigation keeps clean URLs, respects reduced-motion preferences, and exposes 44 px header touch targets.
- Mobile rendering disables deferred section layout below 900 px to prevent height corrections from feeling like scroll jumps.
- P3: a future iteration may introduce subtle image transitions, provided reduced-motion preferences remain respected.

final result: passed
