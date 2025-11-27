import type {
  ArcRotateCamera,
  Color3,
  Engine,
  Mesh,
  Scene,
  StandardMaterial,
} from "babylonjs";
import type { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";

export type GameMode = "playing" | "dead_gap" | "dead_hazard";
export type PauseState = "running" | "paused" | "countdown";

export interface GameState {
  mode: GameMode;
  time: number;
  scrollOffset: number;
  pause: PauseState;
  countdownTime: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  restartRequested: boolean;
  pauseToggleRequested: boolean;
}

export type TileKind = "safe" | "gap" | "hazard";

export interface TrackData {
  tiles: Mesh[];
  rowsConfig: TileKind[][];
  trackLength: number;
  laneXPositions: number[];
  minX: number;
  maxX: number;
  maxZOffset: number;
  tileSize: number;
  tilesX: number;
  tilesZ: number;
  halfTilesX: number;
  safeMaterial: StandardMaterial;
  hazardMaterial: StandardMaterial;
}

export interface BallState {
  bouncePhase: number;
  fallVelocityY: number;
  fallScale: number;
  velX: number;
  velZ: number;
}

export interface HudElements {
  root: HTMLDivElement;
  distance: HTMLDivElement;
  time: HTMLDivElement;
  status: HTMLDivElement;
  controls: HTMLDivElement;
  banner: HTMLDivElement;
}

export interface DebugParams {
  lateralAcceleration: number;
  lateralFriction: number;
  cameraFollowXFactor: number;
  cameraFollowZFactor: number;
  cameraFovBoost: number;
  bounceSpeed: number;
  bounceHeight: number;
  scrollSpeed: number;
}

export interface GameContext {
  engine: Engine;
  scene: Scene;
  camera: ArcRotateCamera;
  ui: AdvancedDynamicTexture;
  gameOverText: TextBlock;
  ball: Mesh;
  ballMaterial: StandardMaterial;
  ballBaseColor: Color3;
  ballState: BallState;
  track: TrackData;
  input: InputState;
  gameState: GameState;
  hud: HudElements;
  debug: DebugParams;
}
