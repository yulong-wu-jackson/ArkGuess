# Type Definitions & Theme System

**Created:** 2026-01-24 21:30
**Status:** Draft
**Dependencies:** ticket_001_project-setup

## Overview
Define TypeScript types for the game domain and implement the theme loading system that reads character data from manifest.json files.

## Context
- Themes are stored in `/public/images/{theme-name}/`
- Each theme contains a `manifest.json` with character metadata
- Characters have id, name, and image filename
- Source for Arknights characters: https://prts.wiki/w/干员一览 (thumbnails)

## Requirements

### Type Definitions
- [ ] Create `src/types/index.ts` with:
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
- [ ] Create `src/lib/theme-loader.ts` with functions:
  - `loadThemeManifest(themeId: string): Promise<ThemeManifest>`
  - `getThemeList(): Promise<string[]>` (reads available theme folders)
  - `getCharacterImageUrl(theme: Theme, character: Character): string`
- [ ] Handle missing/invalid manifest.json gracefully (skip theme, log warning)
- [ ] Handle image load failures (return placeholder path)

### Sample Theme Data
- [ ] Create `/public/images/arknights/manifest.json` with ~50 characters
- [ ] Download character thumbnails from PRTS Wiki (干员一览)
- [ ] Use consistent naming: `{character_id}.png`
- [ ] Include popular operators: 阿米娅, 陈, 银灰, 艾雅法拉, 能天使, etc.

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
- For development, create a themes index file or use import.meta.glob
- Character images should be ~200x200px, PNG or WebP format
- PRTS Wiki thumbnail URL pattern: `https://prts.wiki/images/thumb/{hash}/{filename}/180px-{filename}`

## Acceptance Criteria

- [ ] All TypeScript types compile without errors
- [ ] `loadThemeManifest('arknights')` returns valid manifest
- [ ] Arknights theme has at least 49 characters (for 7x7 grid)
- [ ] Missing manifest returns appropriate error
- [ ] `getCharacterImageUrl()` returns correct path
- [ ] Character images load successfully in browser
