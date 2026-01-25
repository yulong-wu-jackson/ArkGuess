# Type Definitions & Theme System

**Created:** 2026-01-24 21:30
**Status:** Complete
**Dependencies:** ticket_001_project-setup

## Overview
Define TypeScript types for the game domain and implement the theme loading system that reads character data from manifest.json files.

## Context
- Themes are stored in `/public/images/{theme-name}/`
- Each theme contains a `manifest.json` with character metadata
- Characters have id, name, and image filename
- Source for Arknights characters: https://github.com/Aceship/Arknight-Images (avatars)

## Requirements

### Type Definitions
- [x] Create `src/types/index.ts` with:
  ```typescript
  interface Character {
    id: string;
    name: string;
    image: string;
  }

  interface ThemeManifest {
    name: string;
    characters: Character[];
  }

  interface Theme {
    id: string;           // folder name
    manifest: ThemeManifest;
    basePath: string;     // path to theme images
  }

  type MarkerType = 'x' | 'o' | null;

  interface CellState {
    character: Character;
    marker: MarkerType;
  }

  interface GameState {
    theme: Theme;
    gridSize: number;
    cells: CellState[];
    activeMarker: 'x' | 'o';
  }
  ```

### Theme Loading
- [x] Create `src/lib/theme-loader.ts` with functions:
  - `loadThemeManifest(themeId: string): Promise<ThemeManifest>`
  - `getThemeList(): string[]` (returns available theme list)
  - `getCharacterImageUrl(theme: Theme, character: Character): string`
- [x] Handle missing/invalid manifest.json gracefully (skip theme, log warning)
- [x] Handle image load failures (return placeholder path)

### Sample Theme Data
- [x] Create `/public/images/arknights/manifest.json` with 59 characters
- [x] Download character thumbnails from Aceship/Arknight-Images
- [x] Use consistent naming: `{character_id}.png`
- [x] Include popular operators: 阿米娅, 陈, 银灰, 艾雅法拉, 能天使, etc.

## Design Decisions

- **Manifest-based:** Decouples image files from metadata, easier maintenance
- **Async loading:** Themes loaded on demand, not bundled
- **Graceful degradation:** Missing images show placeholder, don't break game

## Scope

**In scope:**
- TypeScript type definitions
- Theme manifest loading logic
- Sample Arknights theme with ~50 characters
- Error handling for missing data

**Out of scope:**
- Theme selection UI (ticket_003)
- Game state management hooks
- Multiple themes (only Arknights for v1)

## Technical Notes

- Use `fetch()` to load manifest.json from `/images/{theme}/manifest.json`
- Character images are ~180x180px PNG format from Aceship repository
- Placeholder SVG provided for image load failures

## Acceptance Criteria

- [x] All TypeScript types compile without errors
- [x] `loadThemeManifest('arknights')` returns valid manifest
- [x] Arknights theme has at least 49 characters (for 7x7 grid) - 59 characters available
- [x] Missing manifest returns appropriate error
- [x] `getCharacterImageUrl()` returns correct path
- [x] Character images load successfully in browser
