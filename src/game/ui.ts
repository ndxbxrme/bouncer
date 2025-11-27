import type { GameContext, HudElements } from "./types";

function createLabel(text: string, fontSize = "12px", opacity = 0.85): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  el.style.fontSize = fontSize;
  el.style.opacity = opacity.toString();
  el.style.marginBottom = "6px";
  return el;
}

export function createHud(): HudElements {
  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.top = "16px";
  root.style.left = "16px";
  root.style.color = "#e9f0ff";
  root.style.fontFamily = "'Inter', system-ui, sans-serif";
  root.style.pointerEvents = "none";
  root.style.background = "linear-gradient(135deg, rgba(18,31,63,0.6), rgba(18,48,74,0.45))";
  root.style.padding = "12px 14px";
  root.style.borderRadius = "10px";
  root.style.boxShadow = "0 8px 22px rgba(0,0,0,0.35)";
  root.style.backdropFilter = "blur(6px)";
  root.style.border = "1px solid rgba(255,255,255,0.08)";

  const title = document.createElement("div");
  title.textContent = "BOUND";
  title.style.fontSize = "15px";
  title.style.fontWeight = "700";
  title.style.letterSpacing = "0.08em";
  title.style.marginBottom = "6px";
  title.style.opacity = "0.9";

  const distance = createLabel("Distance: 0m", "13px");
  const time = createLabel("Time: 0.0s", "13px");
  const status = createLabel("Status: Ready", "13px");

  const controls = createLabel("WASD/Arrows move • SPACE restart", "11px", 0.75);
  controls.style.marginTop = "4px";

  root.append(title, distance, time, status, controls);
  document.body.appendChild(root);

  return { root, distance, time, status, controls };
}

export function updateHud(ctx: GameContext): void {
  const meters = ctx.gameState.scrollOffset.toFixed(1);
  const seconds = ctx.gameState.time.toFixed(1);

  ctx.hud.distance.textContent = `Distance: ${meters}m`;
  ctx.hud.time.textContent = `Time: ${seconds}s`;

  let statusText = "Playing";
  if (ctx.gameState.mode === "dead_gap") {
    statusText = "Fell into a gap";
  } else if (ctx.gameState.mode === "dead_hazard") {
    statusText = "Hit a hazard";
  }
  ctx.hud.status.textContent = `Status: ${statusText}`;
}

