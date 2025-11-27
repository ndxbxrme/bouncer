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

export interface GameState {
  mode: GameMode;
  time: number;
  scrollOffset: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  restartRequested: boolean;
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
}

export interface HudElements {
  root: HTMLDivElement;
  distance: HTMLDivElement;
  time: HTMLDivElement;
  status: HTMLDivElement;
  controls: HTMLDivElement;
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
}
