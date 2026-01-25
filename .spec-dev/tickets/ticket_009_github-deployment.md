# GitHub Actions Deployment

**Created:** 2026-01-24 21:30
**Status:** Complete
**Dependencies:** ticket_001_project-setup

## Overview
Configure GitHub Actions workflow to automatically build and deploy the application to GitHub Pages on push to main branch.

## Context
- Application is a static site (no backend)
- GitHub Pages hosts the built files
- GitHub Actions provides CI/CD
- Base URL must be configured for repository subdirectory hosting

## Requirements

### GitHub Actions Workflow
- [ ] Create `.github/workflows/deploy.yml`
- [ ] Trigger: push to `main` branch
- [ ] Jobs:
  1. Install dependencies
  2. Build production bundle
  3. Deploy to GitHub Pages
- [ ] Use latest Node.js LTS version
- [ ] Cache npm dependencies for faster builds

### Workflow File Structure
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Vite Configuration for GitHub Pages
- [ ] Update `vite.config.ts` to set `base` option
- [ ] Base should match repository name: `/ArkGuess/` (or use env variable)
- [ ] Example:
  ```typescript
  export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? '/ArkGuess/' : '/',
    // ... rest of config
  })
  ```

### Repository Settings
- [ ] Document required GitHub repository settings:
  - Settings → Pages → Source: "GitHub Actions"
  - (No need to select branch when using Actions)

### Build Verification
- [ ] Ensure `npm run build` completes without errors
- [ ] Verify built assets reference correct base path
- [ ] Test locally with `npm run preview` to simulate production

## Design Decisions

- **GitHub Actions over other CI:** Native integration, free for public repos, simple setup
- **Modern actions:** Using v4 of official actions for latest features
- **Concurrency control:** Cancel in-progress deploys if new push arrives
- **Artifact-based deploy:** More reliable than direct push to gh-pages branch

## Scope

**In scope:**
- GitHub Actions workflow file
- Vite base path configuration
- Documentation for repo settings
- Build verification

**Out of scope:**
- Custom domain setup
- Preview deployments for PRs
- Build status badges
- Multiple environment deployments

## Technical Notes

- GitHub Pages URL format: `https://{username}.github.io/{repo-name}/`
- If repo name changes, `base` in vite.config.ts must be updated
- The `permissions` block is required for the new Pages deployment method
- `npm ci` is faster than `npm install` for CI environments

## Acceptance Criteria

- [ ] `.github/workflows/deploy.yml` exists with correct configuration
- [ ] Push to `main` branch triggers workflow
- [ ] Workflow completes successfully
- [ ] Site is accessible at GitHub Pages URL
- [ ] All assets (images, JS, CSS) load correctly
- [ ] Navigation within app works (no 404s on refresh for SPA routes)
- [ ] Workflow uses dependency caching
- [ ] Build time is reasonable (< 3 minutes)
