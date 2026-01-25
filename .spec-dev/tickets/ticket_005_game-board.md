# Game Board & Character Cards

**Created:** 2026-01-24 21:30
**Status:** Draft
**Dependencies:** ticket_002_types-and-theme-system

## Overview
Create the main game board component that displays characters in a grid layout, and the individual character card component showing the character image and name.

## Context
- Game board is the primary gameplay screen
- Grid size varies from 2x2 to 7x7 based on user selection
- Each cell contains one character card
- Cards will later support marking (ticket_006)
- Must work on both desktop and mobile

## Requirements

### Game Board Component
- [ ] Create `src/components/GameBoard.tsx`
- [ ] Accept props: `characters: Character[]`, `gridSize: number`
- [ ] Render a square grid of `gridSize x gridSize` cells
- [ ] Grid should be responsive and centered on screen
- [ ] Maximum board width: 800px on desktop
- [ ] Cells should maintain 1:1 aspect ratio
- [ ] Small gap between cells (4-8px)

### Character Card Component
- [ ] Create `src/components/CharacterCard.tsx`
- [ ] Accept props: `character: Character`, `theme: Theme`, `marker?: MarkerType`
- [ ] Display character image (fills card area)
- [ ] Display character name below/overlaid on image
- [ ] Handle image load errors with placeholder
- [ ] Card has subtle border/shadow for definition
- [ ] Hover state for interactivity feedback

### Layout & Sizing
- [ ] Board fills available width up to max-width
- [ ] Cards resize proportionally with board
- [ ] Name text scales or truncates appropriately
- [ ] Minimum readable card size: ~60px on mobile
- [ ] Consider landscape vs portrait orientations

### Shuffle Logic
- [ ] For random mode: shuffle characters before placing in grid
- [ ] Use Fisher-Yates shuffle algorithm
- [ ] Create utility function `shuffleArray<T>(array: T[]): T[]`

## Design Decisions

- **Fixed grid, not scrollable:** All cells visible at once for classic Guess Who gameplay
- **Character name visible:** Helps players identify characters during questioning
- **Square cells:** Consistent with character portrait images

## Scope

**In scope:**
- GameBoard grid layout component
- CharacterCard display component
- Responsive sizing
- Shuffle utility for random mode
- Image error handling

**Out of scope:**
- Marking functionality (ticket_006)
- Click handlers for gameplay (ticket_006)
- Game state management (ticket_006)

## Technical Notes

- Use CSS Grid for the board layout: `grid-template-columns: repeat(gridSize, 1fr)`
- Use `aspect-ratio: 1` for square cells
- Consider using `object-fit: cover` for character images
- Name could use text shadow for readability over images
- Test with 2x2 (4 cards) up to 7x7 (49 cards) to ensure scaling works

## Acceptance Criteria

- [ ] GameBoard renders correct number of cells for given gridSize
- [ ] Grid is square and responsive
- [ ] CharacterCard displays character image correctly
- [ ] CharacterCard displays character name readably
- [ ] Missing images show placeholder without breaking layout
- [ ] Board looks good at 2x2 (large cards) and 7x7 (small cards)
- [ ] Board is centered and doesn't exceed max-width
- [ ] Shuffle function randomizes character order
- [ ] Works on both desktop (min 1024px) and mobile (375px)
