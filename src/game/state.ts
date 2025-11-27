import { resetBall } from "./ball";
import { regenerateRows, updateTrack } from "./track";
import type { GameContext, GameMode, GameState } from "./types";
import { STARTING_SLAMS } from "./config";

export type { GameMode, GameState } from "./types";

export function createGameState(): GameState {
  return {
    mode: "playing",
    time: 0,
    scrollOffset: 0,
    pause: "running",
    countdownTime: 0,
    slamTokens: STARTING_SLAMS,
  };
}

export function resetGameState(ctx: GameContext): void {
  ctx.gameState.mode = "playing";
  ctx.gameState.time = 0;
  ctx.gameState.scrollOffset = 0;
  ctx.gameState.pause = "countdown";
  ctx.gameState.countdownTime = 1.0; // 1 second get-ready
  ctx.gameState.slamTokens = STARTING_SLAMS;
  resetBall(ctx);
  regenerateRows(ctx.track);
  updateTrack(0, ctx);
  ctx.input.restartRequested = false;
  ctx.gameOverText.alpha = 0;
}

export function updateGameState(dt: number, ctx: GameContext): void {
  const restartRequested = ctx.input.restartRequested;
  const pauseToggle = ctx.input.pauseToggleRequested;
  ctx.input.restartRequested = false;
  ctx.input.pauseToggleRequested = false;

  if (ctx.gameState.mode !== "playing" && restartRequested) {
    resetGameState(ctx);
    return;
  }

  if (pauseToggle && ctx.gameState.mode === "playing") {
    if (ctx.gameState.pause === "running") {
      ctx.gameState.pause = "paused";
    } else if (ctx.gameState.pause === "paused") {
      ctx.gameState.pause = "running";
    }
  }

  if (ctx.gameState.pause === "countdown") {
    ctx.gameState.countdownTime -= dt;
    if (ctx.gameState.countdownTime > 0) {
      return;
    }
    ctx.gameState.pause = "running";
    ctx.gameState.countdownTime = 0;
  }

  const isPlaying = ctx.gameState.mode === "playing" && ctx.gameState.pause === "running";

  if (isPlaying) {
    ctx.gameState.time += dt;
    ctx.gameState.scrollOffset =
      (ctx.gameState.scrollOffset + ctx.debug.scrollSpeed * dt) % ctx.track.trackLength;
  }
}
