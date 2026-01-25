# Project Setup & Infrastructure

**Created:** 2026-01-24 21:30
**Status:** Complete
**Dependencies:** None

## Overview
Initialize the ArkGuess project with Vite, React 18+, TypeScript, Tailwind CSS v4, and shadcn/ui. Establish the folder structure and base configuration.

## Context
- Greenfield project with no existing code
- Target deployment: GitHub Pages (static site)
- Primary language: Chinese (zh-CN)
- Tech stack defined in PRD

## Requirements

- [x] Initialize Vite project with React and TypeScript template
- [x] Install and configure Tailwind CSS v4
- [x] Initialize shadcn/ui with required configuration
- [x] Create folder structure as defined in PRD:
  ```
  /
  ├── public/
  │   └── images/           # Theme images will go here
  ├── src/
  │   ├── components/
  │   │   └── ui/           # shadcn/ui components
  │   ├── hooks/            # Custom React hooks
  │   ├── lib/              # Utility functions
  │   ├── types/            # TypeScript type definitions
  │   └── App.tsx
  └── package.json
  ```
- [x] Configure TypeScript with strict mode
- [x] Set up path aliases (e.g., `@/` for `src/`)
- [x] Add base shadcn/ui components: Button, Card, Dialog, Select
- [x] Verify dev server runs without errors

## Design Decisions

- **Vite over CRA:** Faster builds, better DX, native ESM support
- **Tailwind v4:** Latest version with improved performance
- **shadcn/ui:** Copy-paste components, full control, no runtime dependency

## Scope

**In scope:**
- Project initialization
- Dependency installation
- Folder structure creation
- Base configuration files

**Out of scope:**
- Game logic
- UI components beyond shadcn/ui base
- Deployment configuration (separate ticket)

## Technical Notes

- Use `pnpm create vite@latest` with React + TypeScript template
- Tailwind v4 uses `@tailwindcss/vite` plugin
- shadcn/ui requires `components.json` configuration
- Set `base` in `vite.config.ts` to repository name for GitHub Pages compatibility

## Acceptance Criteria

- [x] `pnpm dev` starts development server without errors
- [x] TypeScript compilation passes with zero errors
- [x] Tailwind CSS classes work in components
- [x] shadcn/ui Button component renders correctly
- [x] Folder structure matches PRD specification
