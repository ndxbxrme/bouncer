import { describe, expect, it, vi } from "vitest";

vi.mock("../src/game/ball", () => ({
  resetBall: vi.fn(),
}));

vi.mock("../src/game/track", () => ({
  regenerateRows: vi.fn(),
}));

import * as stateModule from "../src/game/state";
import { resetGameState, updateGameState, createGameState } from "../src/game/state";
import type { GameContext } from "../src/game/types";

function makeCtx(): GameContext {
  return {
    engine: {} as any,
    scene: {} as any,
    camera: {} as any,
    ui: {} as any,
    gameOverText: { alpha: 0 } as any,
    hud: {
      root: {} as any,
      distance: { textContent: "" } as any,
      time: { textContent: "" } as any,
      status: { textContent: "" } as any,
      controls: { textContent: "" } as any,
    },
    ball: {} as any,
    ballMaterial: {} as any,
    ballBaseColor: {} as any,
    ballState: { bouncePhase: 0, fallVelocityY: 0, fallScale: 1 },
    track: {
      trackLength: 20,
      tiles: [],
      rowsConfig: [],
      laneXPositions: [],
      tilesX: 5,
      tilesZ: 5,
      tileSize: 2,
      halfTilesX: 2,
      minX: -2,
      maxX: 2,
      maxZOffset: 1,
      safeMaterial: {} as any,
      hazardMaterial: {} as any,
    },
    input: { left: false, right: false, up: false, down: false, restartRequested: false },
    gameState: createGameState(),
  };
}

describe("state module", () => {
  it("updateGameState advances time and scroll when playing", () => {
    const ctx = makeCtx();
    updateGameState(0.5, ctx);
    expect(ctx.gameState.time).toBeCloseTo(0.5);
    expect(ctx.gameState.scrollOffset).toBeGreaterThan(0);
  });

  it("resetGameState returns to playing mode and clears UI", () => {
    const ctx = makeCtx();
    ctx.gameState.mode = "dead_gap";
    ctx.gameOverText.alpha = 1;
    ctx.input.restartRequested = true;

    resetGameState(ctx);

    expect(ctx.gameState.mode).toBe("playing");
    expect(ctx.gameOverText.alpha).toBe(0);
    expect(ctx.input.restartRequested).toBe(false);
  });

  it("updateGameState triggers reset when restart requested and not playing", () => {
    const ctx = makeCtx();
    ctx.gameState.mode = "dead_hazard";
    ctx.input.restartRequested = true;
    updateGameState(0.1, ctx);
    expect(ctx.gameState.mode).toBe("playing");
    expect(ctx.gameState.time).toBe(0);
    expect(ctx.gameState.scrollOffset).toBe(0);
    expect(ctx.input.restartRequested).toBe(false);
  });
});
