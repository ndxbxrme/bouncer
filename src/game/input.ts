import type { InputState } from "./types";

function setKeyState(state: InputState, key: string, isDown: boolean) {
  switch (key) {
    case "ArrowLeft":
    case "a":
    case "A":
      state.left = isDown;
      break;
    case "ArrowRight":
    case "d":
    case "D":
      state.right = isDown;
      break;
    case "ArrowUp":
    case "w":
    case "W":
      state.up = isDown;
      break;
    case "ArrowDown":
    case "s":
    case "S":
      state.down = isDown;
      break;
    default:
      break;
  }
}

export function createInput(): InputState {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    restartRequested: false,
  };
}

export function attachInputHandlers(state: InputState): void {
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      state.restartRequested = true;
      return;
    }

    setKeyState(state, e.key, true);
  });

  window.addEventListener("keyup", (e) => {
    setKeyState(state, e.key, false);
  });
}

