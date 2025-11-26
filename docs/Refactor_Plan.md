# Refactor & Project Structure Plan for the Bounder-Style Babylon.js Game

This document describes how to turn the current single-file prototype (`demo.html` in the repo root) into a small, well-structured web game project suitable for long-term development.

It is written as **instructions for an AI coding assistant (like Codex)**.

---

## 1. Goals

- Keep **all existing gameplay behavior** from `demo.html`:
  - Bouncing ball
  - Squash & stretch
  - Scrolling tiles, gaps, hazards
  - Gap fall & hazard death
  - Space-to-restart
- Move from a **single HTML file** to a **modular source layout**.
- Use a modern toolchain (Vite + TypeScript) for fast iteration and clean imports.

---

## 2. Target Project Structure

Reshape the repo to look like this:

```text
.
├─ docs/
│  ├─ Bounder_Design_Document.md    # already present
│  └─ Refactor_Plan.md              # this file (can be placed here)
├─ public/
│  └─ favicon.ico                    # optional
├─ src/
│  ├─ index.html                     # HTML shell for Vite
│  ├─ main.ts                        # app entry point
│  ├─ game/
│  │  ├─ scene.ts                    # engine + scene bootstrap
│  │  ├─ ball.ts                     # ball creation & animation
│  │  ├─ track.ts                    # tiles, hazards, generation
│  │  ├─ input.ts                    # keyboard controls
│  │  ├─ state.ts                    # game state & reset logic
│  │  └─ config.ts                   # tunable constants
│  └─ assets/
│     ├─ textures/                   # (empty for now)
│     └─ audio/                      # (empty for now)
├─ demo.html                         # original prototype, kept for reference
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ .gitignore
└─ README.md
```

> Note: `demo.html` should remain untouched as a working reference, but it will no longer be the main entry point once the refactor is done.

---

## 3. Tooling Setup (Vite + TypeScript)

1. Initialize the project with Vite (Vanilla + TypeScript):

   ```bash
   npm create vite@latest . -- --template vanilla-ts
   ```

   If the repo already has `package.json`, adjust accordingly instead of overwriting it.

2. Install Babylon.js and GUI:

   ```bash
   npm install babylonjs @babylonjs/gui
   ```

3. Ensure `package.json` has at least:

   ```jsonc
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

4. Ensure `.gitignore` contains:

   ```gitignore
   node_modules
   dist
   .DS_Store
   ```

---

## 4. HTML Shell (`src/index.html`)

Create `src/index.html` with a minimal canvas-only shell:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Bounder-Style Babylon.js Game</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <canvas id="renderCanvas"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Vite will use this as the main HTML template.

---

## 5. Entry Point (`src/main.ts`)

Create `src/main.ts`:

- Import and call a `createGame` function from `game/scene.ts`.
- Only responsibility: **start the game**.

Example:

```ts
import { createGame } from "./game/scene";

createGame();
```

---

## 6. Scene Bootstrap (`src/game/scene.ts`)

Responsibilities:

- Create Babylon `Engine` and `Scene`.
- Set up the canvas, resize handling, and render loop.
- Call into other modules (`track`, `ball`, `input`, `state`) during initialization.

Implementation notes:

1. Select the canvas via `document.getElementById("renderCanvas") as HTMLCanvasElement`.
2. Create `engine`, `scene`, `camera`, and `light` here (based on the logic currently in `demo.html`).
3. Import functions:

   - `createTrack(scene)` from `track.ts`
   - `createBall(scene)` and `updateBall(dt, gameContext)` from `ball.ts`
   - `createInput()` / `getInputState()` from `input.ts`
   - `createGameState()` / `updateGameState(dt, context)` / `resetGameState(...)` from `state.ts`

4. Define a `GameContext` interface (in `scene.ts` or a separate `types.ts`) that holds references to:
   - `scene`, `engine`, `camera`
   - `ball` mesh
   - `track` data structure (rows config, tiles array)
   - `input` state
   - `gameState` enum / variables
   - configuration values from `config.ts`

5. In the render loop, call a high-level `update(dt, context)` function that lives in `scene.ts` and internally calls:
   - `updateGameState(dt, context)`
   - `updateBall(dt, context)`
   - `updateTrack(dt, context)`

Try to keep `scene.ts` as a **thin orchestrator**.

---

## 7. Ball Logic (`src/game/ball.ts`)

Responsibilities:

- Create the ball mesh and material.
- Handle:
  - Bounce motion
  - Squash & stretch
  - Gap fall animation
  - Visual changes on hazard death
- Expose functions:

  ```ts
  import type { GameContext } from "./scene"; // or from a shared types file

  export function createBall(scene: BABYLON.Scene): BABYLON.Mesh;
  export function updateBall(dt: number, ctx: GameContext): void;
  export function triggerGapDeath(ctx: GameContext): void;
  export function triggerHazardDeath(ctx: GameContext): void;
  export function resetBall(ctx: GameContext): void;
  ```

Implementation detail:

- Port all ball-related code from `demo.html`:
  - Bounce `bouncePhase` and vertical position logic.
  - Squash/stretch logic (including lerp and clamp).
  - Fall animation (gravity, scaling).
  - Color changes.

State (like `bouncePhase`, `fallVelocityY`, etc.) can either:
- Live in a `BallState` object stored on `ctx`, or
- Be stored on the ball mesh via `ball.metadata`.

Prefer using a `BallState` attached to `ctx` for type clarity.

---

## 8. Track & Tiles (`src/game/track.ts`)

Responsibilities:

- Create the grid of tile meshes.
- Maintain:
  - `rowsConfig[z][x]` (safe/gap/hazard).
  - Any metadata needed for track length and tile lookup.
- Handle infinite scrolling and row regeneration.
- Provide a helper to determine the tile under the ball at landing.

Functions to expose:

```ts
export type TileKind = "safe" | "gap" | "hazard";

export interface TrackData {
  tiles: BABYLON.Mesh[];
  rowsConfig: TileKind[][];
  trackLength: number;
}

export function createTrack(scene: BABYLON.Scene): TrackData;
export function regenerateRows(track: TrackData): void;
export function updateTrack(dt: number, ctx: GameContext): void;

/**
 * Given ball x/z and scrollOffset, return the TileKind under the ball.
 */
export function getTileKindUnderBall(
  x: number,
  z: number,
  track: TrackData,
  ctx: GameContext
): TileKind;
```

Port all existing logic from `demo.html` (row generation rules, scroll offset, wrapping logic) into this module.

---

## 9. Input Handling (`src/game/input.ts`)

Responsibilities:

- Register `keydown` / `keyup` listeners on `window`.
- Maintain a simple state object:

  ```ts
  export interface InputState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    restartRequested: boolean; // set when Space is pressed
  }
  ```

- Expose:

  ```ts
  export function createInput(): InputState;
  export function attachInputHandlers(state: InputState): void;
  ```

- `restartRequested` should be set when Space is pressed and then **consumed** (cleared) by the game state logic after handling a reset.

---

## 10. Game State (`src/game/state.ts`)

Responsibilities:

- Own the high-level state machine: `"playing" | "dead_gap" | "dead_hazard"`.
- Keep track of:
  - `scrollOffset`
  - `time`
  - Any scoring or distance metrics (future feature).
- Expose:

  ```ts
  export type GameMode = "playing" | "dead_gap" | "dead_hazard";

  export interface GameState {
    mode: GameMode;
    time: number;
    scrollOffset: number;
  }

  export function createGameState(): GameState;
  export function updateGameState(dt: number, ctx: GameContext): void;
  export function resetGameState(ctx: GameContext): void;
  ```

Implementation notes:

- Move all logic that:
  - Advances `time` and `scrollOffset`.
  - Switches modes on gap/hazard collision.
  - Checks for Space press to restart.
- `updateGameState` should:
  - Early-out from certain updates when not in `"playing"` mode.
  - Trigger `resetGameState` when `restartRequested` is true.

The collision check on landing (currently in the main loop) should eventually move into the state layer or a dedicated collision helper, but can remain in `scene.ts` initially if simpler.

---

## 11. Config Module (`src/game/config.ts`)

Create a single module that exports all constant values currently hard-coded in `demo.html`, such as:

```ts
export const TILE_SIZE = 2;
export const TILES_X = 5;
export const TILES_Z = 20;

export const SCROLL_SPEED = 8;

export const BOUNCE_SPEED = 6;
export const BOUNCE_HEIGHT = 0.7;
export const BASE_HEIGHT = 0.8;

export const SQUASH_STRENGTH = 0.2;
export const STRETCH_STRENGTH = 0.25;

// probabilities for gaps/hazards, etc.
export const GAP_PROBABILITY = 0.15;
export const HAZARD_PROBABILITY = 0.15;
```

Both `ball.ts` and `track.ts` should import from here instead of using magic numbers.

---

## 12. README and Docs

1. Update `README.md` to include:

   - Short description of the project.
   - How to run the dev server:

     ```bash
     npm install
     npm run dev
     ```

   - Link to the design doc and this refactor plan, e.g.:

     ```md
     See [docs/Bounder_Design_Document.md](docs/Bounder_Design_Document.md)
     and [docs/Refactor_Plan.md](docs/Refactor_Plan.md) for design and architecture details.
     ```

2. Move this file to `docs/Refactor_Plan.md` once the refactor is done.

---

## 13. Acceptance Criteria

The refactor is **successful** if:

- Running `npm run dev` starts a Vite dev server, and the game in the browser:
  - Behaves the same as `demo.html` (movement, hazards, deaths, restart).
  - Shows no TypeScript compilation errors.
- `demo.html` still works as a historical reference, but is no longer needed for normal development.
- The project compiles with `npm run build` without errors.
- Code is split across the modules listed above and free of obvious duplication.

Once this is complete, the codebase will be ready for:
- Adding scoring, HUD, and level systems,
- Swapping out visual styles,
- Exporting a production build for deployment (GitHub Pages, itch.io, etc.).
