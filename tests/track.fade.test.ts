import { describe, expect, it, vi } from "vitest";
import * as mockBabylon from "./helpers/mockBabylon";

vi.mock("babylonjs", () => mockBabylon);

import { updateTrack } from "../src/game/track";
import type { GameContext, TrackData } from "../src/game/types";

function makeTrack(): TrackData {
  const makeTile = (zIndex: number, baseX: number) => ({
    metadata: { baseZIndex: zIndex, baseX, laneIndex: 0, kind: "safe" as const },
    position: { x: 0, y: 0, z: 0 },
    visibility: 1,
    isVisible: true,
  });

  return {
    tiles: [makeTile(0, 0)],
    rowsConfig: [["safe"]],
    trackLength: 40,
    laneXPositions: [0],
    minX: -2,
    maxX: 2,
    maxZOffset: 1,
    tileSize: 2,
    tilesX: 1,
    tilesZ: 1,
    halfTilesX: 0,
    safeMaterial: {} as any,
    hazardMaterial: {} as any,
  };
}

function makeCtx(track: TrackData, scrollOffset: number): GameContext {
  return {
    engine: {} as any,
    scene: {} as any,
    camera: {} as any,
    ui: {} as any,
    gameOverText: {} as any,
    hud: {
      root: {} as any,
      distance: {} as any,
      time: {} as any,
      status: {} as any,
      controls: {} as any,
      banner: {} as any,
    },
    ball: {} as any,
    ballMaterial: {} as any,
    ballBaseColor: {} as any,
    ballState: { bouncePhase: 0, fallVelocityY: 0, fallScale: 1, velX: 0, velZ: 0 },
    debug: {
      lateralAcceleration: 20,
      lateralFriction: 6,
      cameraFollowXFactor: 0.08,
      cameraFollowZFactor: 0.12,
      cameraFovBoost: 0.03,
      bounceSpeed: 6,
      bounceHeight: 0.7,
      scrollSpeed: 8,
      slamBounceMultiplier: 1.6,
    },
    track,
    input: {
      left: false,
      right: false,
      up: false,
      down: false,
      restartRequested: false,
      pauseToggleRequested: false,
    },
    gameState: {
      mode: "playing",
      time: 0,
      scrollOffset,
      pause: "running",
      countdownTime: 0,
    },
  };
}

describe("track fading", () => {
  it("fades tiles behind the camera", () => {
    const track = makeTrack();
    const ctx = makeCtx(track, 3); // tile z becomes -3 (fade region)
    updateTrack(0, ctx);
    expect(track.tiles[0].visibility).toBeLessThan(1);
    expect(track.tiles[0].visibility).toBeGreaterThan(0);
  });

  it("wraps tiles once past clear distance", () => {
    const track = makeTrack();
    const ctx = makeCtx(track, 10); // tile z becomes -10 -> wrap
    updateTrack(0, ctx);
    expect(track.tiles[0].position.z).toBeGreaterThan(0);
    expect(track.tiles[0].visibility).toBe(1);
  });
});
