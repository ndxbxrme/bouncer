import { describe, expect, it } from "vitest";
import { createDebugParams, attachDebugPanel } from "../src/game/debug";

describe("debug panel", () => {
  it("initializes with config defaults", () => {
    const params = createDebugParams();
    expect(params.lateralAcceleration).toBeGreaterThan(0);
    expect(params.lateralFriction).toBeGreaterThan(0);
  });

  it("updates params when slider changes", () => {
    const params = createDebugParams();
    const panel = attachDebugPanel(params);
    const slider = panel.querySelector("input[type=range]") as HTMLInputElement;
    expect(slider).toBeTruthy();
    slider.value = "10";
    slider.dispatchEvent(new Event("input"));
    expect(params.lateralAcceleration).toBeCloseTo(10);
  });

  it("contains bounce and scroll sliders", () => {
    const params = createDebugParams();
    const panel = attachDebugPanel(params);
    const labels = Array.from(panel.querySelectorAll("label")).map((l) => l.textContent);
    expect(labels).toEqual(expect.arrayContaining(["Bounce Spd", "Bounce Ht", "Scroll"]));
  });
});
