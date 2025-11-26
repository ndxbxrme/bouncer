import { describe, expect, it, vi, beforeEach } from "vitest";
import * as mockBabylon from "./helpers/mockBabylon";
import * as mockGUI from "./helpers/mockGUI";

vi.mock("babylonjs", () => mockBabylon);
vi.mock("@babylonjs/gui", () => mockGUI);

import { createGame } from "../src/game/scene";

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
});
