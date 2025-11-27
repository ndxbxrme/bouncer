import { describe, expect, it } from "vitest";
import { getTileKindUnderBall } from "../src/game/track";
import type { GameContext, TrackData } from "../src/game/types";

function makeTrack(): TrackData {
  return {
    tiles: [],
    rowsConfig: [
      ["safe", "gap", "hazard", "safe", "safe"],
      ["gap", "safe", "safe", "hazard", "safe"],
    ],
    trackLength: 40,
    laneXPositions: [-4, -2, 0, 2, 4],
    minX: -4,
    maxX: 4,
    maxZOffset: 1,
    tileSize: 2,
    tilesX: 5,
    tilesZ: 2,
    halfTilesX: 2,
    safeMaterial: {} as any,
    hazardMaterial: {} as any,
  };
}

function makeCtx(track: TrackData): GameContext {
  return {
    engine: {} as any,
    scene: {} as any,
    camera: {} as any,
    ui: {} as any,
    gameOverText: {} as any,
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
    hud: {
      root: {} as any,
      distance: { textContent: "" } as any,
      time: { textContent: "" } as any,
      status: { textContent: "" } as any,
      controls: { textContent: "" } as any,
      banner: { textContent: "", style: {} as any } as any,
      slams: { textContent: "" } as any,
    },
    ball: {} as any,
    ballMaterial: {} as any,
    ballBaseColor: {} as any,
    ballState: {
      bouncePhase: 0,
      fallVelocityY: 0,
      fallScale: 1,
      velX: 0,
      velZ: 0,
      activeBounceMultiplier: 1,
      nextBounceBoost: 1,
      slamPulseTime: 0,
    },
    track,
    input: {
      left: false,
      right: false,
      up: false,
      down: false,
      restartRequested: false,
      pauseToggleRequested: false,
      slamRequested: false,
    },
    gameState: {
      mode: "playing",
      time: 0,
      scrollOffset: 0,
      pause: "running",
      countdownTime: 0,
      slamTokens: 5,
    },
  };
}

describe("track module", () => {
  it("returns correct tile kind based on ball position and scroll", () => {
    const track = makeTrack();
    const ctx = makeCtx(track);

    // position over row 0, lane index 0 -> safe
    expect(getTileKindUnderBall(-4, 0, track, ctx)).toBe("safe");

    // position over row 0, lane index 2 -> hazard
    expect(getTileKindUnderBall(0, 0, track, ctx)).toBe("hazard");

    // After scrolling, land on second row with gap
    ctx.gameState.scrollOffset = 2;
    expect(getTileKindUnderBall(-4, 0, track, ctx)).toBe("gap");
  });
});
