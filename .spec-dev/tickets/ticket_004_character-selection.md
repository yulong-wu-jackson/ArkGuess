# Character Selection (Custom Mode)

**Created:** 2026-01-24 21:30
**Status:** Draft
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
- [ ] Create `src/components/CharacterPicker.tsx`
- [ ] Display all characters from selected theme in a responsive grid
- [ ] Each character shows: thumbnail image, name below
- [ ] Grid adapts to screen width (3-6 columns depending on viewport)

### Selection Mechanics
- [ ] Click to select/deselect a character
- [ ] Selected characters have visual indicator (border, overlay, checkmark)
- [ ] Track selection count in real-time
- [ ] Show "已选择 {n}/{required}" counter prominently

### Validation
- [ ] Display required count based on grid size (e.g., "需要选择 25 个角色")
- [ ] "开始游戏" button disabled until exact count selected
- [ ] If user selects more than required, show warning and prevent further selection
- [ ] If user tries to start with wrong count, show error message

### Quick Actions
- [ ] "全选" (Select All) button - selects first N characters needed
- [ ] "清除选择" (Clear Selection) button - deselects all
- [ ] "随机选择" (Random Selection) button - randomly picks required count

### Navigation
- [ ] "返回" (Back) button to return to home page
- [ ] "开始游戏" button to proceed to game board
- [ ] Pass selected characters to game board

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

- [ ] All theme characters display in a responsive grid
- [ ] Clicking a character toggles its selection state
- [ ] Selected characters have clear visual indicator
- [ ] Selection counter updates in real-time
- [ ] Cannot select more characters than required
- [ ] Start button disabled until exact count reached
- [ ] "全选" selects first N required characters
- [ ] "清除选择" deselects all characters
- [ ] "随机选择" picks random characters up to required count
- [ ] "返回" navigates back to home page
- [ ] "开始游戏" proceeds to game board with selected characters
