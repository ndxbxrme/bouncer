import { resetBall } from "./ball";
import { SCROLL_SPEED } from "./config";
import { regenerateRows } from "./track";
import type { GameContext, GameMode, GameState } from "./types";

export type { GameMode, GameState } from "./types";

export function createGameState(): GameState {
  return {
    mode: "playing",
    time: 0,
    scrollOffset: 0,
  };
}

export function resetGameState(ctx: GameContext): void {
  ctx.gameState.mode = "playing";
  ctx.gameState.time = 0;
  ctx.gameState.scrollOffset = 0;
  resetBall(ctx);
  regenerateRows(ctx.track);
  ctx.input.restartRequested = false;
  ctx.gameOverText.alpha = 0;
}

export function updateGameState(dt: number, ctx: GameContext): void {
  const restartRequested = ctx.input.restartRequested;
  ctx.input.restartRequested = false;

  const isPlaying = ctx.gameState.mode === "playing";
  if (isPlaying) {
    ctx.gameState.time += dt;
    ctx.gameState.scrollOffset =
      (ctx.gameState.scrollOffset + SCROLL_SPEED * dt) % ctx.track.trackLength;
  } else if (restartRequested) {
    resetGameState(ctx);
    return;
  }
}

