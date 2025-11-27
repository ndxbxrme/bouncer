import type { DebugParams } from "./types";
import {
  BOUNCE_HEIGHT,
  BOUNCE_SPEED,
  CAMERA_FOV_BOOST,
  CAMERA_FOLLOW_X_FACTOR,
  CAMERA_FOLLOW_Z_FACTOR,
  LATERAL_ACCELERATION,
  LATERAL_FRICTION,
  SLAM_BOUNCE_MULTIPLIER,
  SCROLL_SPEED,
} from "./config";

export function createDebugParams(): DebugParams {
  return {
    lateralAcceleration: LATERAL_ACCELERATION,
    lateralFriction: LATERAL_FRICTION,
    cameraFollowXFactor: CAMERA_FOLLOW_X_FACTOR,
    cameraFollowZFactor: CAMERA_FOLLOW_Z_FACTOR,
    cameraFovBoost: CAMERA_FOV_BOOST,
    bounceSpeed: BOUNCE_SPEED,
    bounceHeight: BOUNCE_HEIGHT,
    scrollSpeed: SCROLL_SPEED,
    slamBounceMultiplier: SLAM_BOUNCE_MULTIPLIER,
  };
}

interface SliderSpec {
  label: string;
  key: keyof DebugParams;
  min: number;
  max: number;
  step: number;
}

function createSlider(
  spec: SliderSpec,
  params: DebugParams
): { wrapper: HTMLDivElement; valueEl: HTMLSpanElement; input: HTMLInputElement } {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "space-between";
  wrapper.style.gap = "10px";
  wrapper.style.marginBottom = "6px";

  const label = document.createElement("label");
  label.textContent = spec.label;
  label.style.fontSize = "11px";
  label.style.opacity = "0.8";
  label.style.flex = "1";

  const valueEl = document.createElement("span");
  valueEl.textContent = params[spec.key].toFixed(2);
  valueEl.style.fontSize = "11px";
  valueEl.style.opacity = "0.8";
  valueEl.style.width = "36px";
  valueEl.style.textAlign = "right";

  const input = document.createElement("input");
  input.type = "range";
  input.min = spec.min.toString();
  input.max = spec.max.toString();
  input.step = spec.step.toString();
  input.value = params[spec.key].toString();
  input.style.flex = "2";

  input.addEventListener("input", () => {
    const v = parseFloat(input.value);
    params[spec.key] = v;
    valueEl.textContent = v.toFixed(2);
  });

  wrapper.append(label, valueEl, input);
  return { wrapper, valueEl, input };
}

export function attachDebugPanel(params: DebugParams): HTMLDivElement {
  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.bottom = "16px";
  root.style.right = "16px";
  root.style.width = "240px";
  root.style.color = "#e9f0ff";
  root.style.fontFamily = "'Inter', system-ui, sans-serif";
  root.style.pointerEvents = "auto";
  root.style.background = "linear-gradient(135deg, rgba(12,19,35,0.72), rgba(20,32,52,0.62))";
  root.style.padding = "12px";
  root.style.borderRadius = "10px";
  root.style.boxShadow = "0 8px 22px rgba(0,0,0,0.38)";
  root.style.backdropFilter = "blur(8px)";
  root.style.border = "1px solid rgba(255,255,255,0.08)";
  root.style.zIndex = "5";

  const title = document.createElement("div");
  title.textContent = "Tuning";
  title.style.fontSize = "13px";
  title.style.fontWeight = "700";
  title.style.letterSpacing = "0.04em";
  title.style.marginBottom = "6px";
  title.style.opacity = "0.9";

  const sliders: SliderSpec[] = [
    { label: "Accel", key: "lateralAcceleration", min: 4, max: 40, step: 0.5 },
    { label: "Friction", key: "lateralFriction", min: 1, max: 18, step: 0.25 },
    { label: "Cam X", key: "cameraFollowXFactor", min: 0, max: 0.3, step: 0.01 },
    { label: "Cam Z", key: "cameraFollowZFactor", min: 0, max: 0.3, step: 0.01 },
    { label: "FOV Boost", key: "cameraFovBoost", min: 0, max: 0.12, step: 0.005 },
    { label: "Bounce Spd", key: "bounceSpeed", min: 2, max: 12, step: 0.1 },
    { label: "Bounce Ht", key: "bounceHeight", min: 0.2, max: 1.6, step: 0.05 },
    { label: "Scroll", key: "scrollSpeed", min: 2, max: 14, step: 0.2 },
    { label: "Slam Boost", key: "slamBounceMultiplier", min: 1, max: 3, step: 0.05 },
  ];

  root.appendChild(title);
  for (const s of sliders) {
    const { wrapper } = createSlider(s, params);
    root.appendChild(wrapper);
  }

  document.body.appendChild(root);
  return root;
}
