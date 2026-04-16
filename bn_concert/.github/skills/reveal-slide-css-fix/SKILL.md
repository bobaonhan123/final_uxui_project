---
name: reveal-slide-css-fix
description: "Diagnose and fix Reveal.js slide layout issues in index.html and css/theme.css. USE FOR: overflow, clipping, non-wrapping text, fixed-height boxes, desktop 1920x1080 fit, mobile media-query behavior, slide 14/16 layout regressions. DO NOT USE FOR: React Native frontend bugs in bn_concert."
license: MIT
metadata:
  author: VoGiaCu Team
  version: "1.0.0"
---

# Reveal.js Slide CSS Fix Skill

Use this skill to debug and patch presentation layout bugs in the Reveal.js deck files:
- `index.html`
- `css/theme.css`

## Scope

- Keep desktop slides stable at 1920x1080.
- Preserve mobile behavior under existing responsive rules.
- Apply minimal, slide-scoped CSS changes.
- Prevent regressions in neighboring slides.

## Workflow

1. Find target slide markup in `index.html` and list exact class names.
2. Locate corresponding selectors in `css/theme.css`.
3. Check both base rules and `@media (max-width: 768px)` overrides.
4. Patch with the smallest possible change set.
5. Re-check nearby slides that share related selectors.

## Common Root Causes In This Deck

- Long English copy breaks fixed row/card heights.
- Flex rows with fixed children overflow when text grows.
- `white-space: nowrap` causes horizontal clipping.
- Late-file overrides unintentionally change earlier slide behavior.
- Desktop-only fixes regress mobile when media-query updates are missing.

## Safe Fix Patterns

### Pattern A: Make comparison rows resilient

```css
.improvement-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}

.improvement-before p,
.improvement-after p {
  overflow-wrap: anywhere;
}
```

### Pattern B: Mobile stack for comparison rows

```css
@media (max-width: 768px) {
  .improvement-item { grid-template-columns: 1fr; }
  .improvement-arrow { justify-self: center; transform: rotate(90deg); }
}
```

### Pattern C: Keep mockup showcase stable on desktop

```css
.hifi-showcase {
  display: flex;
  flex-wrap: nowrap;
  gap: 40px;
}

.phone-mockup { flex: 0 1 220px; min-width: 0; }
```

### Pattern D: Prevent fixed-height clipping

```css
.contrast-box {
  min-height: 80px;
  height: auto;
}
```

## Validation Checklist

### Desktop (1920x1080)

- No overlap, clipping, or unwanted wrapping in the target slide.
- Action labels and captions remain readable.
- Related slides (especially adjacent ones) still look consistent.

### Mobile

- Blocks stack cleanly without horizontal scrolling.
- Arrows/icons remain aligned after stacking.
- Mockups and cards keep readable spacing.

## Regression Guardrails

- Prefer slide-specific selectors over global `.reveal` changes.
- Avoid broad typography and spacing edits unless required.
- If using `!important`, justify it and verify no side effects.
- Pair every desktop layout change with a mobile check.

## Definition Of Done

- Target slide bug is fixed on desktop and mobile.
- Neighboring slides have no new visual regressions.
- Changes are minimal, local, and maintain original visual intent.
