# Marking System & Game Mechanics

**Created:** 2026-01-24 21:30
**Status:** Draft
**Dependencies:** ticket_005_game-board

## Overview
Implement the core gameplay mechanics: marker tool selection (Red X / Blue O) and the ability to mark/unmark characters on the game board.

## Context
- "Guess Who?" is a two-player game where each player eliminates characters
- Red player uses X marks, Blue player uses O marks
- Players mark characters they've ruled out
- Both markers can coexist on the same card (optional feature)
- Marking is toggle-based: click to add, click again to remove

## Requirements

### Marker Tools Component
- [ ] Create `src/components/MarkerTools.tsx`
- [ ] Display two tool buttons: Red (X) and Blue (O)
- [ ] Clear visual indication of which tool is selected
- [ ] Tool buttons should be large and touch-friendly
- [ ] Position: fixed at bottom or top of game screen
- [ ] Color coding:
  - Red tool: red/crimson color, X icon
  - Blue tool: blue color, O icon

### Marking Logic
- [ ] Click on character card applies current marker
- [ ] If card has no marker → add current marker
- [ ] If card has same marker → remove marker
- [ ] If card has different marker → replace with current marker (or add both?)
- [ ] Visual feedback on click (brief animation or state change)

### Marker Display on Cards
- [ ] Update CharacterCard to accept and display `marker` prop
- [ ] X marker: semi-transparent red overlay with X symbol
- [ ] O marker: semi-transparent blue overlay with O symbol
- [ ] Markers should not fully obscure character image
- [ ] Consider corner badge vs full overlay approaches

### Game State Hook
- [ ] Create `src/hooks/useGameState.ts`
- [ ] Manage: cells state, active marker, theme, gridSize
- [ ] Functions: `setMarker(cellIndex)`, `setActiveMarker(type)`, `resetGame()`
- [ ] Use React Context to provide state to components
- [ ] Initial state: no markers, red tool selected by default

### State Shape
```typescript
interface GameState {
  theme: Theme;
  gridSize: number;
  cells: CellState[];  // array of { character, marker }
  activeMarker: 'x' | 'o';
}
```

## Design Decisions

- **Toggle behavior:** Clicking same marker removes it, enabling easy correction
- **Different marker replacement:** Clicking different marker replaces existing one (simplifies state)
- **Red default:** Red (X) is selected by default when game starts
- **Markers are visual aids:** No win condition enforced; players manage game verbally

## Scope

**In scope:**
- Marker tool selection UI
- Click-to-mark functionality
- Marker display on character cards
- Game state management hook
- React Context for state sharing

**Out of scope:**
- Win/lose detection
- Turn tracking
- Undo/redo history
- Game statistics

## Technical Notes

- Use React Context for game state to avoid prop drilling
- Marker overlay can use CSS `::after` pseudo-element or a child div
- X mark: two diagonal lines or ✕ symbol
- O mark: circle outline or ○ symbol
- Consider using `mix-blend-mode` for overlay effect
- Touch targets should be at least 44x44px for mobile

## UI Text Reference

| Element | Chinese |
|---------|---------|
| Red marker | 红方 (X) |
| Blue marker | 蓝方 (O) |

## Acceptance Criteria

- [ ] Marker tools display with red and blue buttons
- [ ] Selected tool has clear visual distinction
- [ ] Clicking tool button switches active marker
- [ ] Clicking unmarked card adds current marker
- [ ] Clicking card with same marker removes it
- [ ] Clicking card with different marker replaces it
- [ ] X marker shows red overlay with X symbol
- [ ] O marker shows blue overlay with O symbol
- [ ] Character image and name remain visible under marker
- [ ] Game state updates correctly on each action
- [ ] Default state: red (X) tool selected, no markers on board
