# Character Selection (Custom Mode)

**Created:** 2026-01-24 21:30
**Status:** Complete
**Dependencies:** ticket_002_types-and-theme-system, ticket_003_theme-selection-page

## Overview
Implement the character selection screen for custom mode, where users manually pick which characters to include in their game grid.

## Context
- Only shown when user selects "自选模式" on home page
- Users must select exactly `gridSize²` characters (e.g., 16 for 4x4)
- All characters from the theme are displayed for selection
- After selection, proceeds to game board with chosen characters

## Requirements

### Character Grid Display
- [x] Create `src/components/CharacterPicker.tsx`
- [x] Display all characters from selected theme in a responsive grid
- [x] Each character shows: thumbnail image, name below
- [x] Grid adapts to screen width (3-6 columns depending on viewport)

### Selection Mechanics
- [x] Click to select/deselect a character
- [x] Selected characters have visual indicator (border, overlay, checkmark)
- [x] Track selection count in real-time
- [x] Show "已选择 {n}/{required}" counter prominently

### Validation
- [x] Display required count based on grid size (e.g., "需要选择 25 个角色")
- [x] "开始游戏" button disabled until exact count selected
- [x] If user selects more than required, show warning and prevent further selection
- [x] If user tries to start with wrong count, show error message

### Quick Actions
- [x] "全选" (Select All) button - selects first N characters needed
- [x] "清除选择" (Clear Selection) button - deselects all
- [x] "随机选择" (Random Selection) button - randomly picks required count

### Navigation
- [x] "返回" (Back) button to return to home page
- [x] "开始游戏" button to proceed to game board
- [x] Pass selected characters to game board

## Design Decisions

- **Exact count requirement:** User must select exactly the right number, not more or less
- **Quick actions:** Help users who don't want to manually pick 49 characters for 7x7
- **Visual feedback:** Clear selection state prevents confusion

## Scope

**In scope:**
- Character display grid
- Multi-select functionality
- Selection count validation
- Quick action buttons
- Navigation to game board

**Out of scope:**
- Search/filter characters
- Character details/info
- Sorting options
- Favorites system

## Technical Notes

- Use CSS Grid or Flexbox for responsive character grid
- Consider virtualization if character count exceeds ~100 (not needed for v1)
- Store selected character IDs in a Set for O(1) lookup
- Pass selected Character[] array to game board component

## UI Text Reference

| Element | Chinese |
|---------|---------|
| Page title | 选择角色 |
| Counter | 已选择 {n}/{total} |
| Select all | 全选 |
| Clear selection | 清除选择 |
| Random select | 随机选择 |
| Back button | 返回 |
| Start button | 开始游戏 |
| Too many selected | 已达到选择上限 |
| Need more | 还需选择 {n} 个角色 |

## Acceptance Criteria

- [x] All theme characters display in a responsive grid
- [x] Clicking a character toggles its selection state
- [x] Selected characters have clear visual indicator
- [x] Selection counter updates in real-time
- [x] Cannot select more characters than required
- [x] Start button disabled until exact count reached
- [x] "全选" selects first N required characters
- [x] "清除选择" deselects all characters
- [x] "随机选择" picks random characters up to required count
- [x] "返回" navigates back to home page
- [x] "开始游戏" proceeds to game board with selected characters
