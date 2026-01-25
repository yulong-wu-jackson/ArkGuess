# ArkGuess 猜猜我是谁

A web-based "Guess Who?" digital board game featuring Arknights characters. Players can mark/unmark characters on a customizable grid using Red (X) and Blue (O) markers.

---

## Project Overview

- **Type:** Static web application (no backend)
- **Deployment:** GitHub Pages via GitHub Actions
- **UI Language:** Chinese (zh-CN)
- **Target Users:** Arknights players and board game enthusiasts

---

## Core Principles

1. **Research Before Code** — Use DeepWiki MCP to learn external tools/libraries before implementation
2. **Never Skip Steps** — Complete each step fully before proceeding
3. **Verify Everything** — Run automated tests AND manual verification
4. **Quality Gates** — Invoke `spec-dev:code-reviewer` after each implementation step
5. **Ask When Uncertain** — Use `AskUserQuestion` to clarify requirements

---

## Tech Stack (choose the latest stable version)

| Category | Technology |
|----------|------------|
| Framework | React 18+ with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| State Management | React Context (no external libraries) |
| Deployment | GitHub Pages via GitHub Actions |

---


## UI Text Reference (Chinese)

| Element | Chinese |
|---------|---------|
| Page title | ArkGuess 猜猜我是谁 |
| Theme section | 选择主题 |
| Grid size | 网格大小 |
| Random mode | 随机模式 |
| Custom mode | 自选模式 |
| Start game | 开始游戏 |
| End game | 结束游戏 |
| Red marker | 红方 (X) |
| Blue marker | 蓝方 (O) |
| Confirm end | 确定要结束游戏吗？ |
| Cancel | 取消 |
| Confirm | 确定 |
| Back | 返回 |
| Select all | 全选 |
| Clear selection | 清除选择 |

---

## Game Rules

1. Grid sizes: 2x2 to 7x7
2. Two modes: Random (auto-fill) and Custom (user picks characters)
3. Two marker types: Red (X) and Blue (O)
4. Click character to add current marker
5. Click same marker again to remove it
6. Click different marker to replace

---

## Theme Manifest Format

Each theme folder requires a `manifest.json`:

```json
{
  "name": "明日方舟",
  "characters": [
    { "id": "amiya", "name": "阿米娅", "image": "amiya.png" },
    { "id": "chen", "name": "陈", "image": "chen.png" }
  ]
}
```

---

## Development Workflow

### Step-by-Step Process

```
1. Research    → Use DeepWiki MCP to understand the tool/library (if needed)
2. Implement   → Write code following best practices
3. Test        → Run automated tests (pnpm test)
4. Verify      → Manually run and verify functionality works
5. Review      → Invoke /spec-dev:code-reviewer
6. Fix         → Address any issues from review
7. Proceed     → Only move to next step after all checks pass
```

### Before Writing Any Code

- [ ] Research the tool/library using DeepWiki MCP
- [ ] Understand existing patterns in codebase
- [ ] Clarify requirements if ambiguous (use AskUserQuestion)

### After Each Implementation Step

- [ ] Run `pnpm test` — all tests must pass
- [ ] manually verify the feature works
- [ ] Run `/spec-dev:code-reviewer` — address all feedback
- [ ] Confirm no regressions in existing functionality

---

## Package Management (pnpm)

**Always use pnpm. Never use npm.**

Common commands:
```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build locally
pnpm lint             # Run linter
pnpm typecheck        # Type check (tsc --noEmit)
```

---

## Code Quality

- Use TypeScript strict mode
- Follow existing shadcn/ui patterns for components
- Keep components focused and single-responsibility
- Use Tailwind utility classes, avoid custom CSS when possible
- All text in UI should be in Chinese
- Use Playwrite MCP to test out the real action of the game and ui/ux experiment

---

## Git Commits

Use `/spec-dev:commit-msg` to Write conventional commit messages. No authorship statements.

---

## Verification Checklist

Before marking any task complete:

- [ ] **Build passes** — `pnpm build` exits 0
- [ ] **Type check passes** — `pnpm typecheck` exits 0
- [ ] **Lint passes** — `pnpm lint` exits 0
- [ ] **Manual verification** — Feature works as expected in `pnpm dev`
- [ ] **Code review done** — `/spec-dev:code-reviewer` feedback addressed
- [ ] **No regressions** — Existing features still work
- [ ] **Responsive check** — Works on mobile (375px) and desktop

---

## Research Protocol

When encountering an unfamiliar tool or library:

1. **DeepWiki First** — Query DeepWiki MCP for best practices
2. **Web Search** — Search for current patterns (include year in query)
3. **Official Docs** — Verify with official documentation via WebFetch
4. **Ask User** — If still unclear, use AskUserQuestion

---

## Code Review Invocation

After completing implementation of any feature or fix:
Check to improve code quality and clean,clarity and ensure the full project structure is well structured with best practice and no redundant code.
```
/spec-dev:code-reviewer
```

Address all issues before proceeding to next task.

---

## Prohibited Actions

- Skipping tests or manual verification
- Proceeding without passing all checks
- Writing code for unfamiliar libraries without DeepWiki research
- Making assumptions without clarifying ambiguous requirements
- Using npm instead of pnpm
- Adding UI text in English (use Chinese)

---

## Implementation Tickets

Tickets are located in `.spec-dev/tickets/` and should be implemented in order:

| Order | Ticket | Description |
|-------|--------|-------------|
| 1 | ticket_001_project-setup.md | Vite + React + TS + Tailwind + shadcn/ui |
| 2 | ticket_002_types-and-theme-system.md | TypeScript types, theme loader, sample data |
| 3 | ticket_003_theme-selection-page.md | Home page with theme/grid/mode selection |
| 4 | ticket_004_character-selection.md | Custom mode character picker |
| 5 | ticket_005_game-board.md | Game grid and character cards |
| 6 | ticket_006_marking-system.md | Red/Blue markers and game state |
| 7 | ticket_007_game-flow-navigation.md | Screen navigation, end game |
| 8 | ticket_008_p1-polish-features.md | Responsive, lazy loading, animations |
| 9 | ticket_009_github-deployment.md | GitHub Actions workflow |

To implement a ticket:
```
/spec-dev:implement-ticket .spec-dev/tickets/ticket_00X_name.md
```

---

## Important URLs

- **Character images source:** https://prts.wiki/w/干员一览 (PRTS Wiki thumbnails)
- **shadcn/ui docs:** https://ui.shadcn.com/docs
- **Tailwind v4 docs:** https://tailwindcss.com/docs