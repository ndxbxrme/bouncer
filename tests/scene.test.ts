import { describe, expect, it, vi, beforeEach } from "vitest";
import * as mockBabylon from "./helpers/mockBabylon";
import * as mockGUI from "./helpers/mockGUI";

vi.mock("babylonjs", () => mockBabylon);
vi.mock("@babylonjs/gui", () => mockGUI);

import { applyCameraEffects, createGame } from "../src/game/scene";
import { updateHud } from "../src/game/ui";

beforeEach(() => {
  document.body.innerHTML = '<canvas id="renderCanvas"></canvas>';
});

describe("scene layout and resize", () => {
  it("applies full-screen canvas styling", () => {
    const ctx = createGame();
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    expect(canvas.style.width).toBe("100vw");
    expect(canvas.style.height).toBe("100vh");
    expect(canvas.style.display).toBe("block");
    expect(canvas.style.touchAction).toBe("none");
    expect(document.body.style.margin).toMatch(/^0/);
    expect(document.body.style.padding).toMatch(/^0/);
    expect(ctx).toBeTruthy();
  });

  it("resizes engine on window resize", () => {
    const ctx = createGame();
    const resizeSpy = vi.spyOn(ctx.engine, "resize");
    window.dispatchEvent(new Event("resize"));
    expect(resizeSpy).toHaveBeenCalled();
  });

  it("updates HUD values from game context", () => {
    const ctx = createGame();
    ctx.gameState.scrollOffset = 12.3;
    ctx.gameState.time = 4.2;
    ctx.gameState.mode = "dead_gap";
    updateHud(ctx);
    expect(ctx.hud.distance.textContent).toContain("12.3");
    expect(ctx.hud.time.textContent).toContain("4.2");
    expect(ctx.hud.status.textContent).toContain("Fell");
  });

  it("applies camera follow/bob/fov effects", () => {
    const ctx = createGame();
    ctx.ball.position.x = 4;
    ctx.ball.position.z = 2;
    ctx.gameState.time = 1.0;
    ctx.ballState.velX = 2;
    ctx.input.right = true;
    const initialTargetX = ctx.camera.target.x;
    const initialFov = ctx.camera.fov;
    applyCameraEffects(ctx, 0.016);
    expect(ctx.camera.target.x).toBeGreaterThan(initialTargetX);
    expect(ctx.camera.target.z).toBeGreaterThan(0);
    expect(ctx.camera.fov).toBeGreaterThanOrEqual(initialFov);
  });

  it("applies slam pulse to fov", () => {
    const ctx = createGame();
    ctx.ballState.slamPulseTime = 0.3;
    const initialFov = ctx.camera.fov;
    applyCameraEffects(ctx, 0.016);
    expect(ctx.camera.fov).toBeGreaterThan(initialFov);
  });

  it("exposes debug params with defaults", () => {
    const ctx = createGame();
    expect(ctx.debug.lateralAcceleration).toBeGreaterThan(0);
    expect(ctx.debug.lateralFriction).toBeGreaterThan(0);
    expect(ctx.debug.bounceSpeed).toBeGreaterThan(0);
    expect(ctx.debug.scrollSpeed).toBeGreaterThan(0);
    expect(ctx.debug.slamBounceMultiplier).toBeGreaterThan(0);
  });
});
