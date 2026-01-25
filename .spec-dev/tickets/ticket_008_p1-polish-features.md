# P1 Polish Features

**Created:** 2026-01-24 21:30
**Status:** Draft
**Dependencies:** ticket_007_game-flow-navigation

## Overview
Implement P1 priority polish features: responsive layout improvements, image lazy loading, and animation feedback for marker operations.

## Context
- Core game functionality complete after ticket_007
- These features improve user experience but aren't blocking for basic gameplay
- Focus on performance and visual polish
- Must support 375px (mobile) to 1920px (desktop) viewport widths

## Requirements

### Responsive Layout (P1)
- [ ] Audit all screens for mobile responsiveness
- [ ] Home page:
  - Stack elements vertically on mobile
  - Theme cards: 1 column on mobile, 2-3 on tablet/desktop
  - Full-width buttons on mobile
- [ ] Character selection:
  - 3 columns on mobile, 4-5 on tablet, 6 on desktop
  - Sticky header with selection counter
  - Bottom action buttons always visible
- [ ] Game screen:
  - Board fills width with padding on mobile
  - Marker tools at bottom, large touch targets
  - Consider landscape orientation on mobile
- [ ] Test breakpoints: 375px, 768px, 1024px, 1920px
- [ ] Ensure touch targets are minimum 44x44px

### Image Lazy Loading (P1)
- [ ] Implement lazy loading for character images
- [ ] Options:
  - Native `loading="lazy"` attribute (simplest)
  - Intersection Observer for more control
- [ ] Apply to:
  - Character picker grid (potentially many images)
  - Theme preview images if added
- [ ] Show low-quality placeholder or skeleton while loading
- [ ] Images in game board should NOT be lazy (all visible at once)

### Animation Feedback (P1)
- [ ] Marker add animation:
  - Brief scale/pop effect when marker appears
  - Subtle fade-in for overlay
  - Duration: 150-200ms
- [ ] Marker remove animation:
  - Fade out effect
  - Duration: 100-150ms
- [ ] Tool switch animation:
  - Active tool indicator slides or transitions
  - Selected state change is animated
- [ ] Character card hover:
  - Slight lift/scale on desktop
  - No hover effect on touch devices
- [ ] Button interactions:
  - Press feedback (scale down slightly)
  - State transitions are smooth

### Performance Considerations
- [ ] Ensure animations don't cause layout shifts
- [ ] Use CSS transforms and opacity for animations (GPU accelerated)
- [ ] Use `will-change` sparingly for animated elements
- [ ] Test performance on mid-range mobile device
- [ ] Verify no janky animations at 60fps

## Design Decisions

- **Native lazy loading first:** Simplest solution; fall back to IO if needed
- **CSS animations preferred:** Avoid JavaScript animation libraries for simple effects
- **Subtle animations:** Enhance UX without being distracting or slow

## Scope

**In scope:**
- Responsive CSS adjustments for all screens
- Image lazy loading for character picker
- Smooth animations for marker operations
- Hover states and button feedback

**Out of scope:**
- Complex page transitions
- Skeleton loading states (simple placeholder is fine)
- Animation preferences setting (reduce motion)

## Technical Notes

- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- CSS animation: `@keyframes` or Tailwind's `animate-` utilities
- For custom animations, consider `framer-motion` only if CSS is insufficient
- Test on actual mobile device, not just browser devtools
- Use Chrome DevTools Performance tab to verify animation smoothness

## Acceptance Criteria

### Responsive
- [ ] All screens function correctly at 375px width
- [ ] No horizontal scrolling on any screen
- [ ] Touch targets are at least 44x44px
- [ ] Text remains readable at all sizes
- [ ] Layout adapts gracefully across breakpoints

### Lazy Loading
- [ ] Character picker images load lazily
- [ ] Placeholder visible while images load
- [ ] No layout shift when images load
- [ ] Game board images load immediately (not lazy)

### Animations
- [ ] Adding marker shows pop/scale animation
- [ ] Removing marker shows fade animation
- [ ] Tool selection has smooth transition
- [ ] Animations are smooth (60fps)
- [ ] Animations don't delay user interaction
- [ ] Hover effects work on desktop, absent on touch
