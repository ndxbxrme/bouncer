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

  const banner = document.createElement("div");
  banner.textContent = "";
  banner.style.position = "fixed";
  banner.style.left = "50%";
  banner.style.top = "32%";
  banner.style.transform = "translate(-50%, -50%)";
  banner.style.padding = "16px 28px";
  banner.style.borderRadius = "14px";
  banner.style.background = "rgba(6, 10, 20, 0.6)";
  banner.style.boxShadow = "0 10px 30px rgba(0,0,0,0.45)";
  banner.style.color = "#f5f7ff";
  banner.style.fontSize = "22px";
  banner.style.fontWeight = "700";
  banner.style.letterSpacing = "0.06em";
  banner.style.opacity = "0";
  banner.style.transition = "opacity 0.15s ease-out, transform 0.2s ease-out";
  banner.style.pointerEvents = "none";
  banner.style.backdropFilter = "blur(10px)";

  root.append(title, distance, time, status, controls);
  document.body.appendChild(root);
  document.body.appendChild(banner);

  return { root, distance, time, status, controls, banner };
}

export function updateHud(ctx: GameContext): void {
  const meters = ctx.gameState.scrollOffset.toFixed(1);
  const seconds = ctx.gameState.time.toFixed(1);

  ctx.hud.distance.textContent = `Distance: ${meters}m`;
  ctx.hud.time.textContent = `Time: ${seconds}s`;

  let statusText = "Playing";
  if (ctx.gameState.pause === "paused") {
    statusText = "Paused";
  } else if (ctx.gameState.pause === "countdown") {
    statusText = "Get Ready";
  }

  if (ctx.gameState.mode === "dead_gap") {
    statusText = "Fell into a gap";
  } else if (ctx.gameState.mode === "dead_hazard") {
    statusText = "Hit a hazard";
  }
  ctx.hud.status.textContent = `Status: ${statusText}`;

  if (ctx.gameState.pause === "countdown") {
    const secondsLeft = Math.max(0, ctx.gameState.countdownTime);
    ctx.hud.banner.textContent = `Get Ready ${secondsLeft.toFixed(1)}s`;
    ctx.hud.banner.style.opacity = "1";
    ctx.hud.banner.style.transform = "translate(-50%, -50%) scale(1)";
  } else if (ctx.gameState.pause === "paused") {
    ctx.hud.banner.textContent = "Paused — press P";
    ctx.hud.banner.style.opacity = "1";
    ctx.hud.banner.style.transform = "translate(-50%, -50%) scale(1)";
  } else {
    ctx.hud.banner.style.opacity = "0";
    ctx.hud.banner.style.transform = "translate(-50%, -50%) scale(0.98)";
  }
}
