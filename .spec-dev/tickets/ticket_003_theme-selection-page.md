# Theme Selection Page

**Created:** 2026-01-24 21:30
**Status:** Draft
**Dependencies:** ticket_002_types-and-theme-system

## Overview
Create the landing page where users select a theme, choose grid size, and pick between random or custom selection mode before starting the game.

## Context
- First screen users see when visiting the site
- Must display available themes from `/public/images/`
- Grid size range: 2x2 to 7x7
- Two game modes: Random (auto-fill) and Custom (user picks characters)
- UI language: Chinese

## Requirements

### Theme Selector Component
- [ ] Create `src/components/ThemeSelector.tsx`
- [ ] Display all available themes as clickable cards
- [ ] Show theme name from manifest
- [ ] Show character count per theme
- [ ] Visual indication of selected theme

### Grid Size Selector
- [ ] Create grid size selector (dropdown or slider)
- [ ] Range: 2x2 to 7x7 (values 2-7)
- [ ] Default: 4x4
- [ ] Show total cells needed (e.g., "16 个角色")
- [ ] Disable sizes that exceed theme's character count with tooltip explaining why

### Mode Selection
- [ ] Two buttons/cards: "随机模式" and "自选模式"
- [ ] Brief description under each:
  - 随机模式: "随机分配角色到网格"
  - 自选模式: "选择你想要的角色"

### Page Layout
- [ ] Create `src/pages/HomePage.tsx` (or use App.tsx directly)
- [ ] Title: "ArkGuess 猜猜我是谁"
- [ ] Flow: Select Theme → Select Grid Size → Select Mode → Start
- [ ] "开始游戏" button at bottom, disabled until all selections made
- [ ] Clean, centered layout with proper spacing

### State Management
- [ ] Track selected theme, grid size, and mode
- [ ] Pass selections to next screen via React Context or props

## Design Decisions

- **Sequential selection:** Theme first, then grid, then mode - because grid options depend on theme's character count
- **Chinese labels:** Primary audience is Chinese-speaking Arknights players
- **Immediate feedback:** Disabled states with explanations help users understand constraints

## Scope

**In scope:**
- Theme selection UI
- Grid size selection UI
- Mode selection UI
- Basic validation (enough characters for grid)
- Navigation trigger to next screen

**Out of scope:**
- Character selection screen (ticket_004)
- Game board (ticket_005)
- Actual game logic

## Technical Notes

- Use shadcn/ui components: Card, Select, Button
- Theme cards can show a preview image (first character or dedicated cover)
- Consider using RadioGroup for mode selection
- Store selections in parent state or Context for passing to game

## UI Text Reference

| Element | Chinese |
|---------|---------|
| Page title | ArkGuess 猜猜我是谁 |
| Theme section | 选择主题 |
| Grid size section | 网格大小 |
| Mode section | 选择模式 |
| Random mode | 随机模式 |
| Custom mode | 自选模式 |
| Start button | 开始游戏 |
| Characters needed | 需要 {n} 个角色 |
| Not enough chars | 角色数量不足 |

## Acceptance Criteria

- [ ] Theme cards display with name and character count
- [ ] Clicking a theme card selects it visually
- [ ] Grid size dropdown shows options 2-7
- [ ] Grid sizes requiring more characters than available are disabled
- [ ] Mode selection shows both options with descriptions
- [ ] Start button is disabled until theme, grid, and mode are selected
- [ ] Clicking start button triggers navigation/state change
- [ ] All text displays in Chinese
