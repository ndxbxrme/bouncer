# Bounder-Style Babylon.js Game

A Babylon.js take on the classic Bounder feel. The project now uses Vite + TypeScript with modular game code, while keeping the original single-file prototype for reference.

## Getting started

```bash
npm install
npm run dev
```

- `npm run build` produces a production bundle.
- `npm run preview` serves the built files locally.
- `npm test` runs unit tests with Vitest.

Controls: WASD/Arrow keys to move, `Space` to restart, `P` to pause/resume.

CI runs `npm test` on pushes and pull requests (GitHub Actions).

## Docs

See `docs/Bounder_Design_Document.md` and `docs/Refactor_Plan.md` for design details and the refactor checklist.

## Prototype

The original prototype remains at `demo.html` if you need a quick comparison point.
