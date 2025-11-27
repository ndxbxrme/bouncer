import * as BABYLON from "babylonjs";
import {
  GAP_PROBABILITY,
  HAZARD_PROBABILITY,
  SAFE_ROW_COUNT,
  TILE_CLEAR_DISTANCE,
  TILE_FADE_START,
  TILE_SIZE,
  TILES_X,
  TILES_Z,
} from "./config";
import type { GameContext, TileKind, TrackData } from "./types";

interface TileMetadata {
  baseX: number;
  baseZIndex: number;
  laneIndex: number;
  kind: TileKind;
}

function randomizeRow(zIndex: number, tilesX: number): TileKind[] {
  const kinds: TileKind[] = [];
  let safeCount = 0;

  if (zIndex < SAFE_ROW_COUNT) {
    for (let xi = 0; xi < tilesX; xi++) {
      kinds[xi] = "safe";
    }
    return kinds;
  }

  for (let xi = 0; xi < tilesX; xi++) {
    const roll = Math.random();
    let kind: TileKind;
    if (roll < GAP_PROBABILITY) {
      kind = "gap";
    } else if (roll < GAP_PROBABILITY + HAZARD_PROBABILITY) {
      kind = "hazard";
    } else {
      kind = "safe";
      safeCount++;
    }
    kinds[xi] = kind;
  }

  if (safeCount === 0) {
    const safeIndex = Math.floor(Math.random() * tilesX);
    kinds[safeIndex] = "safe";
  }

  return kinds;
}

function applyTileKind(
  tile: BABYLON.Mesh,
  kind: TileKind,
  safeMaterial: BABYLON.StandardMaterial,
  hazardMaterial: BABYLON.StandardMaterial
) {
  const metadata = tile.metadata as TileMetadata;
  metadata.kind = kind;

  if (kind === "safe") {
    tile.material = safeMaterial;
    tile.isVisible = true;
    tile.visibility = 1;
    tile.scaling.y = 1;
    tile.position.y = 0;
  } else if (kind === "gap") {
    tile.material = safeMaterial;
    tile.isVisible = false;
    tile.visibility = 0;
    tile.scaling.y = 1;
    tile.position.y = 0;
  } else if (kind === "hazard") {
    tile.material = hazardMaterial;
    tile.isVisible = true;
    tile.visibility = 1;
    tile.scaling.y = 1.5;
    tile.position.y = 0.4;
  }
}

export function createTrack(scene: BABYLON.Scene): TrackData {
  const laneXPositions: number[] = [];
  const halfTilesX = Math.floor(TILES_X / 2);
  for (let i = 0; i < TILES_X; i++) {
    laneXPositions[i] = (i - halfTilesX) * TILE_SIZE;
  }

  const minX = laneXPositions[0];
  const maxX = laneXPositions[TILES_X - 1];
  const maxZOffset = TILE_SIZE;

  const safeMaterial = new BABYLON.PBRMaterial("safeMat", scene);
  safeMaterial.albedoColor = new BABYLON.Color3(0.08, 0.26, 0.46);
  safeMaterial.metallic = 0.08;
  safeMaterial.roughness = 0.55;
  safeMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.06, 0.1);
  safeMaterial.environmentIntensity = 0.55;

  const hazardMaterial = new BABYLON.PBRMaterial("hazardMat", scene);
  hazardMaterial.albedoColor = new BABYLON.Color3(0.78, 0.12, 0.08);
  hazardMaterial.metallic = 0.12;
  hazardMaterial.roughness = 0.38;
  hazardMaterial.emissiveColor = new BABYLON.Color3(0.35, 0.06, 0.05);
  hazardMaterial.environmentIntensity = 0.65;

  const noiseTexture = new BABYLON.DynamicTexture(
    "tileNoise",
    { width: 64, height: 64 },
    scene,
    false
  );
  const ctx = noiseTexture.getContext();
  if (ctx) {
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const g = 25 + Math.floor(Math.random() * 25);
        ctx.fillStyle = `rgb(${g},${g},${g})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    noiseTexture.update(false);
    noiseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    noiseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    safeMaterial.bumpTexture = noiseTexture;
    hazardMaterial.bumpTexture = noiseTexture;
    safeMaterial.bumpTexture.level = 0.2;
    hazardMaterial.bumpTexture.level = 0.2;
  }

  const rowsConfig: TileKind[][] = [];
  for (let z = 0; z < TILES_Z; z++) {
    rowsConfig[z] = randomizeRow(z, TILES_X);
  }

  const tiles: BABYLON.Mesh[] = [];
  for (let z = 0; z < TILES_Z; z++) {
    for (let xi = 0; xi < TILES_X; xi++) {
      const laneX = laneXPositions[xi];
      const kind = rowsConfig[z][xi];

      const tile = BABYLON.MeshBuilder.CreateBox(
        "tile",
        {
          width: TILE_SIZE * 0.95,
          height: 0.25,
          depth: TILE_SIZE * 0.95,
          subdivisions: 2,
          wrap: true,
        },
        scene
      );

      tile.metadata = {
        baseX: laneX,
        baseZIndex: z,
        laneIndex: xi,
        kind,
      } satisfies TileMetadata;

      const baseZ = z * TILE_SIZE;
      tile.position = new BABYLON.Vector3(laneX, 0, baseZ);

      applyTileKind(tile, kind, safeMaterial, hazardMaterial);
      tiles.push(tile);
      tile.receiveShadows = true;
    }
  }

  const trackLength = TILES_Z * TILE_SIZE;

  return {
    tiles,
    rowsConfig,
    trackLength,
    laneXPositions,
    minX,
    maxX,
    maxZOffset,
    tileSize: TILE_SIZE,
    tilesX: TILES_X,
    tilesZ: TILES_Z,
    halfTilesX,
    safeMaterial,
    hazardMaterial,
  };
}

export function regenerateRows(track: TrackData): void {
  for (let z = 0; z < track.tilesZ; z++) {
    track.rowsConfig[z] = randomizeRow(z, track.tilesX);
  }

  for (const tile of track.tiles) {
    const metadata = tile.metadata as TileMetadata;
    const kind = track.rowsConfig[metadata.baseZIndex][metadata.laneIndex];
    applyTileKind(tile, kind, track.safeMaterial, track.hazardMaterial);
  }
}

export function updateTrack(_dt: number, ctx: GameContext): void {
  const { track } = ctx;

  for (const tile of track.tiles) {
    const metadata = tile.metadata as TileMetadata;
    const baseZ = metadata.baseZIndex * track.tileSize;
    let z = baseZ - ctx.gameState.scrollOffset;
    if (z < TILE_CLEAR_DISTANCE) {
      z += track.trackLength;
    }

    tile.position.z = z;
    tile.position.x = metadata.baseX;

    if (tile.isVisible) {
      const fadeStart = TILE_FADE_START;
      const fadeEnd = TILE_CLEAR_DISTANCE;
      const t = Math.max(0, Math.min(1, (z - fadeEnd) / (fadeStart - fadeEnd)));
      tile.visibility = t;
    } else {
      tile.visibility = 0;
    }
  }
}

export function getTileKindUnderBall(
  x: number,
  z: number,
  track: TrackData,
  ctx: GameContext
): TileKind {
  const laneFloat = x / track.tileSize + track.halfTilesX;
  let laneIndex = Math.round(laneFloat);
  laneIndex = Math.max(0, Math.min(track.tilesX - 1, laneIndex));

  const baseZForBall = ctx.gameState.scrollOffset + z;
  let wrappedBaseZ = baseZForBall % track.trackLength;
  if (wrappedBaseZ < 0) {
    wrappedBaseZ += track.trackLength;
  }

  const currentRowIndex =
    Math.floor((wrappedBaseZ + track.tileSize / 2) / track.tileSize) %
    track.tilesZ;
  return track.rowsConfig[currentRowIndex][laneIndex];
}
