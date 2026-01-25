# Game Flow & Navigation

**Created:** 2026-01-24 21:30
**Status:** Complete
**Dependencies:** ticket_003_theme-selection-page, ticket_004_character-selection, ticket_005_game-board, ticket_006_marking-system

## Overview
Integrate all screens into a cohesive application flow with proper navigation, end game functionality, and screen transitions.

## Context
- Application has multiple screens: Home, Character Selection (custom mode only), Game
- Navigation is state-based (not URL-based for simplicity)
- End game should confirm before returning to home
- All previous components need to be connected

## Requirements

### Application State
- [x] Create `src/contexts/AppContext.tsx`
- [x] Manage current screen: 'home' | 'character-select' | 'game'
- [x] Store game configuration: theme, gridSize, mode, selectedCharacters
- [x] Provide navigation functions: `goToHome()`, `startGame()`, `goToCharacterSelect()`

### Screen Routing
- [x] Update `App.tsx` to render screens based on current state
- [x] Conditional rendering:
  - 'home' → HomePage / ThemeSelector
  - 'character-select' → CharacterPicker (only for custom mode)
  - 'game' → GameBoard with MarkerTools

### Flow: Random Mode
```
Home → Select Theme → Select Grid → Select Random Mode → Start
  → Game Board (shuffled characters) → End Game → Confirm → Home
```

### Flow: Custom Mode
```
Home → Select Theme → Select Grid → Select Custom Mode → Start
  → Character Selection → Select Characters → Start Game
  → Game Board (selected characters) → End Game → Confirm → Home
```

### End Game Feature
- [x] Create "结束游戏" button on game screen
- [x] Position: in toolbar area, clearly visible but not dominant
- [x] On click: show confirmation dialog
- [x] Confirmation dialog:
  - Title: "结束游戏"
  - Message: "确定要结束游戏吗？当前进度将丢失。"
  - Actions: "取消" (cancel), "确定" (confirm)
- [x] On confirm: reset game state, return to home

### Screen Transitions
- [x] Basic fade transition between screens (optional, nice-to-have)
- [x] Preserve scroll position where relevant
- [x] Clear game state when returning to home

### Game Screen Layout
- [x] Combine GameBoard and MarkerTools into single Game screen
- [ ] Layout structure:
  ```
  ┌─────────────────────────┐
  │   Header (title/exit)   │
  ├─────────────────────────┤
  │                         │
  │                         │
  │      Game Board         │
  │                         │
  │                         │
  ├─────────────────────────┤
  │   Marker Tools Bar      │
  └─────────────────────────┘
  ```

## Design Decisions

- **State-based routing:** Simpler than React Router for this small app; no URL history needed
- **Confirmation dialog:** Prevents accidental game end; uses shadcn AlertDialog
- **Single context:** One AppContext manages both navigation and game state for simplicity

## Scope

**In scope:**
- Application-level state management
- Screen navigation logic
- End game with confirmation
- Game screen layout integration
- Flow for both random and custom modes

**Out of scope:**
- URL-based routing
- Browser back button handling
- Game pause/resume
- Save game progress

## Technical Notes

- Use shadcn/ui AlertDialog for end game confirmation
- Consider using `useReducer` for complex state transitions
- Game screen should be a composition of GameBoard + MarkerTools
- Mobile: marker tools could be sticky at bottom

## UI Text Reference

| Element | Chinese |
|---------|---------|
| End game button | 结束游戏 |
| Dialog title | 结束游戏 |
| Dialog message | 确定要结束游戏吗？当前进度将丢失。 |
| Cancel button | 取消 |
| Confirm button | 确定 |
| Header title | ArkGuess |

## Acceptance Criteria

- [x] Home screen renders on app load
- [x] Selecting random mode → immediate game start with shuffled characters
- [x] Selecting custom mode → character selection screen
- [x] Character selection complete → game screen with chosen characters
- [x] Game screen shows board, marker tools, and end game button
- [x] End game button opens confirmation dialog
- [x] Canceling dialog keeps game active
- [x] Confirming dialog returns to home screen
- [x] Game state resets when returning to home
- [x] All navigation transitions work smoothly
- [x] No console errors during navigation
