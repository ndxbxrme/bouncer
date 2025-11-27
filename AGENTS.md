# AGENTS

Notes for AI/code-assist tools working in this repo.

## Project quick facts
- Stack: Vite + TypeScript + Babylon.js (+ @babylonjs/gui), tests via Vitest (jsdom).
- Entry: `index.html` → `src/main.ts` → `src/game/scene.ts`.
- Core modules: `scene` (orchestration), `ball`, `track`, `input`, `state`, `config`, `types`.
- Legacy reference: `demo.html` stays untouched.

## Runbook
- Install: `npm install`
- Dev server: `npm run dev` (Vite)
- Tests: `npm test` (Vitest, jsdom environment)
- Build: `npm run build` (Vite)

## Code conventions
- TypeScript, strict mode. Keep constants in `src/game/config.ts`; share shapes via `src/game/types.ts`.
- Prefer small, single-purpose modules. Avoid reintroducing game logic into the HTML shell.
- Canvas/layout tweaks belong in `scene.ts` (or a dedicated layout helper), not scattered elsewhere.
- Keep `demo.html` as-is; do not “fix” it.

## Testing guidelines
- Add/extend unit tests under `tests/`. Use mocks from `tests/helpers/` and mirror Babylon.js API shape when needed.
- Favor deterministic tests; mock randomness if asserting generation logic.
- When adding features, include at least one test that exercises the new logic or state transition.

## CI
- GitHub Actions runs `npm test` on pushes/PRs (`.github/workflows/ci.yml`). Keep it green.

## When uncertain
- Cross-check behavior against `demo.html` to avoid regressions in core gameplay (bounce, squash/stretch, scrolling tiles, hazards, restart).
- If a change touches input, collision, or state transitions, add/update tests.

