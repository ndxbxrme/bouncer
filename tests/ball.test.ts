import { describe, expect, it, vi } from "vitest";
import * as mockBabylon from "./helpers/mockBabylon";

vi.mock("babylonjs", () => mockBabylon);
vi.mock("@babylonjs/gui", () => ({}));

import { BASE_HEIGHT } from "../src/game/config";
import {
  createBall,
  createBallState,
  resetBall,
  triggerGapDeath,
  triggerHazardDeath,
  updateBall,
} from "../src/game/ball";
import type { GameContext } from "../src/game/types";

function makeCtx(): GameContext {
  const scene = new mockBabylon.Scene();
  const ballResources = createBall(scene as any);
  const ballState = createBallState();

  return {
    engine: new mockBabylon.Engine(),
    scene: scene as any,
    camera: new mockBabylon.ArcRotateCamera("cam", 0, 0, 0, new mockBabylon.Vector3(), scene as any),
    ui: {} as any,
    gameOverText: { alpha: 0 } as any,
    hud: {
      root: {} as any,
      distance: { textContent: "" } as any,
      time: { textContent: "" } as any,
      status: { textContent: "" } as any,
      controls: { textContent: "" } as any,
    },
    ball: ballResources.mesh as any,
    ballMaterial: ballResources.material as any,
    ballBaseColor: ballResources.baseColor as any,
    ballState,
    debug: {
      lateralAcceleration: 20,
      lateralFriction: 6,
      cameraFollowXFactor: 0.08,
      cameraFollowZFactor: 0.12,
      cameraFovBoost: 0.03,
      bounceSpeed: 6,
      bounceHeight: 0.7,
      scrollSpeed: 8,
    },
    track: {
      minX: -2,
      maxX: 2,
      maxZOffset: 1,
      trackLength: 10,
      tileSize: 2,
      tilesX: 5,
      tilesZ: 5,
      halfTilesX: 2,
      rowsConfig: [],
      tiles: [],
      laneXPositions: [],
      safeMaterial: {} as any,
      hazardMaterial: {} as any,
    },
    input: { left: false, right: false, up: false, down: false, restartRequested: false },
    gameState: { mode: "playing", time: 0, scrollOffset: 0 },
  };
}

describe("ball module", () => {
  it("resetBall restores position, scale, and color", () => {
    const ctx = makeCtx();
    ctx.ball.position.x = 3;
    ctx.ball.position.y = 10;
    ctx.ball.position.z = 5;
    ctx.ball.scaling.set(2, 2, 2);
    ctx.ballMaterial.diffuseColor = new mockBabylon.Color3(0, 0, 0) as any;
    ctx.ballState.bouncePhase = 10;
    ctx.ballState.fallVelocityY = 5;
    ctx.ballState.fallScale = 0.2;
    ctx.ballState.velX = 2;
    ctx.ballState.velZ = -3;

    resetBall(ctx);

    expect(ctx.ball.position.x).toBe(0);
    expect(ctx.ball.position.y).toBe(BASE_HEIGHT);
    expect(ctx.ball.position.z).toBe(0);
    expect(ctx.ball.scaling.x).toBe(1);
    expect(ctx.ball.scaling.y).toBe(1);
    expect(ctx.ball.scaling.z).toBe(1);
    expect(ctx.ballMaterial.diffuseColor).toEqual(ctx.ballBaseColor);
    expect(ctx.ballState).toEqual({
      bouncePhase: 0,
      fallVelocityY: 0,
      fallScale: 1,
      velX: 0,
      velZ: 0,
    });
  });

  it("updateBall returns true when bounce phase wraps (landing)", () => {
    const ctx = makeCtx();
    ctx.ballState.bouncePhase = Math.PI - 0.1;
    let landed = false;
    for (let i = 0; i < 10 && !landed; i++) {
      landed = updateBall(0.1, ctx);
    }
    expect(landed).toBe(true);
  });

  it("applies acceleration and friction for smoother direction changes", () => {
    const ctx = makeCtx();
    ctx.input.right = true;
    updateBall(0.2, ctx);
    expect(ctx.ballState.velX).toBeGreaterThan(0);

    // Release input and ensure velocity decays
    ctx.input.right = false;
    const prevVel = ctx.ballState.velX;
    updateBall(0.2, ctx);
    expect(ctx.ballState.velX).toBeLessThan(prevVel);
  });

  it("clamps movement within track bounds", () => {
    const ctx = makeCtx();
    ctx.input.left = true;
    ctx.input.up = true;
    ctx.ball.position.x = ctx.track.minX - 5;
    ctx.ball.position.z = ctx.track.maxZOffset + 5;

    updateBall(0.5, ctx);

    expect(ctx.ball.position.x).toBeGreaterThanOrEqual(ctx.track.minX);
    expect(ctx.ball.position.z).toBeLessThanOrEqual(ctx.track.maxZOffset);
  });

  it("triggerGapDeath switches mode and shows UI", () => {
    const ctx = makeCtx();
    triggerGapDeath(ctx);
    expect(ctx.gameState.mode).toBe("dead_gap");
    expect(ctx.gameOverText.alpha).toBe(1);
  });

  it("triggerHazardDeath switches mode and shows UI", () => {
    const ctx = makeCtx();
    triggerHazardDeath(ctx);
    expect(ctx.gameState.mode).toBe("dead_hazard");
    expect(ctx.gameOverText.alpha).toBe(1);
  });
});
