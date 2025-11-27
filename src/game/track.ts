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
  cycle: number;
}

function randomizeRow(zIndex: number, tilesX: number, rng: () => number): TileKind[] {
  const kinds: TileKind[] = [];
  let safeCount = 0;

  if (zIndex < SAFE_ROW_COUNT) {
    for (let xi = 0; xi < tilesX; xi++) {
      kinds[xi] = "safe";
    }
    return kinds;
  }

  for (let xi = 0; xi < tilesX; xi++) {
    const roll = rng();
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
    const safeIndex = Math.floor(rng() * tilesX);
    kinds[safeIndex] = "safe";
  }

  return kinds;
}

function applyTileKind(
  tile: BABYLON.Mesh,
  kind: TileKind,
  safeMaterial: BABYLON.PBRMaterial,
  hazardMaterial: BABYLON.PBRMaterial
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

function createChamferedTileMesh(scene: BABYLON.Scene): BABYLON.Mesh {
  const width = TILE_SIZE * 0.95;
  const depth = TILE_SIZE * 0.95;
  const height = 0.25;
  const box = BABYLON.MeshBuilder.CreateBox(
    "tileTemplate",
    { width, height, depth, updatable: true },
    scene
  );

  const vertexData = BABYLON.VertexData.ExtractFromMesh(box);
  if (vertexData && vertexData.positions && vertexData.normals) {
    // Soften edges by pulling edge vertices slightly inward and upward.
    const positions = vertexData.positions;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      const edgeFactor = Math.max(Math.abs(x) / (width / 2), Math.abs(z) / (depth / 2));
      const chamfer = Math.max(0, edgeFactor - 0.8) * 0.05;
      positions[i] = x * (1 - chamfer);
      positions[i + 2] = z * (1 - chamfer);
      positions[i + 1] = y + chamfer * 0.2;
    }
    vertexData.positions = positions;
    // Recompute normals for proper lighting.
    const normals: number[] = [];
    BABYLON.VertexData.ComputeNormals(vertexData.positions, vertexData.indices ?? [], normals);
    vertexData.normals = normals;
    vertexData.applyToMesh(box);
  }

  return box;
}

export function createTrack(scene: BABYLON.Scene, rng: () => number): TrackData {
  const laneXPositions: number[] = [];
  const halfTilesX = Math.floor(TILES_X / 2);
  for (let i = 0; i < TILES_X; i++) {
    laneXPositions[i] = (i - halfTilesX) * TILE_SIZE;
  }

  const minX = laneXPositions[0];
  const maxX = laneXPositions[TILES_X - 1];
  const maxZOffset = TILE_SIZE;

  const safeMaterial = new BABYLON.PBRMaterial("safeMat", scene);
  safeMaterial.albedoColor = new BABYLON.Color3(0.06, 0.22, 0.42);
  safeMaterial.metallic = 0.03;
  safeMaterial.roughness = 0.75;
  safeMaterial.emissiveColor = new BABYLON.Color3(0.015, 0.045, 0.08);
  safeMaterial.environmentIntensity = 0.25;

  const hazardMaterial = new BABYLON.PBRMaterial("hazardMat", scene);
  hazardMaterial.albedoColor = new BABYLON.Color3(0.75, 0.12, 0.08);
  hazardMaterial.metallic = 0.05;
  hazardMaterial.roughness = 0.42;
  hazardMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.06, 0.04);
  hazardMaterial.environmentIntensity = 0.25;

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
    rowsConfig[z] = randomizeRow(z, TILES_X, rng);
  }

  const tileTemplate = createChamferedTileMesh(scene);

  const tiles: BABYLON.Mesh[] = [];
  for (let z = 0; z < TILES_Z; z++) {
    for (let xi = 0; xi < TILES_X; xi++) {
      const laneX = laneXPositions[xi];
      const kind = rowsConfig[z][xi];

      const tile = tileTemplate.clone(`tile_${z}_${xi}`);
      tile.material = undefined;
      tile.isVisible = true;
      if ((tile as any).setEnabled) {
        (tile as any).setEnabled(true);
      }

      tile.metadata = {
        baseX: laneX,
        baseZIndex: z,
        laneIndex: xi,
        kind,
        cycle: 0,
      } satisfies TileMetadata;

      const baseZ = z * TILE_SIZE;
      tile.position = new BABYLON.Vector3(laneX, 0, baseZ);

      applyTileKind(tile, kind, safeMaterial, hazardMaterial);
      tiles.push(tile);
      tile.receiveShadows = true;
    }
  }
  tileTemplate.dispose();

  const trackLength = TILES_Z * TILE_SIZE;

  return {
    tiles,
    rowsConfig,
    trackLength,
    rowsOffset: 0,
    rowsCycle: new Array(TILES_Z).fill(0),
    rng,
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
  track.rowsOffset = 0;
  track.rowsCycle.fill(0);
  for (let z = 0; z < track.tilesZ; z++) {
    track.rowsConfig[z] = randomizeRow(z, track.tilesX, track.rng);
  }

  for (const tile of track.tiles) {
    const metadata = tile.metadata as TileMetadata;
    const kind = track.rowsConfig[metadata.baseZIndex][metadata.laneIndex];
    applyTileKind(tile, kind, track.safeMaterial, track.hazardMaterial);
  }
}

export function updateTrack(_dt: number, ctx: GameContext): void {
  const { track } = ctx;
  const trackLength = track.trackLength;
  const offset = ctx.gameState.scrollOffset;

  for (const tile of track.tiles) {
    const metadata = tile.metadata as TileMetadata;
    const baseZ = metadata.baseZIndex * track.tileSize;
    const desiredCycle = Math.max(0, Math.floor((offset - baseZ) / trackLength));

    if (desiredCycle > track.rowsCycle[metadata.baseZIndex] && metadata.laneIndex === 0) {
      const delta = desiredCycle - track.rowsCycle[metadata.baseZIndex];
      track.rowsCycle[metadata.baseZIndex] = desiredCycle;
      track.rowsOffset += delta;
      track.rowsConfig[metadata.baseZIndex] = randomizeRow(
        track.rowsOffset + track.tilesZ,
        track.tilesX,
        track.rng
      );
      for (const rowTile of track.tiles) {
        const rowMeta = rowTile.metadata as TileMetadata;
        if (rowMeta.baseZIndex === metadata.baseZIndex) {
          const kind = track.rowsConfig[metadata.baseZIndex][rowMeta.laneIndex];
          applyTileKind(rowTile, kind, track.safeMaterial, track.hazardMaterial);
          rowMeta.cycle = track.rowsCycle[metadata.baseZIndex];
        }
      }
    }

    const worldRowIndex = metadata.baseZIndex + track.rowsCycle[metadata.baseZIndex] * track.tilesZ;
    let z = worldRowIndex * track.tileSize - offset;

    if (z < TILE_CLEAR_DISTANCE) {
      track.rowsCycle[metadata.baseZIndex] += 1;
      track.rowsOffset += 1;
      track.rowsConfig[metadata.baseZIndex] = randomizeRow(
        track.rowsOffset + track.tilesZ,
        track.tilesX,
        track.rng
      );
      for (const rowTile of track.tiles) {
        const rowMeta = rowTile.metadata as TileMetadata;
        if (rowMeta.baseZIndex === metadata.baseZIndex) {
          const kind = track.rowsConfig[metadata.baseZIndex][rowMeta.laneIndex];
          applyTileKind(rowTile, kind, track.safeMaterial, track.hazardMaterial);
          rowMeta.cycle = track.rowsCycle[metadata.baseZIndex];
        }
      }
      z = (metadata.baseZIndex + track.rowsCycle[metadata.baseZIndex] * track.tilesZ) * track.tileSize - offset;
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

  const rowIndex = Math.floor((ctx.gameState.scrollOffset + z + track.tileSize / 2) / track.tileSize);
  const baseIndex = ((rowIndex % track.tilesZ) + track.tilesZ) % track.tilesZ;
  return track.rowsConfig[baseIndex][laneIndex];
}
