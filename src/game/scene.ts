import {
  ArcRotateCamera,
  Color3,
  CubeTexture,
  DirectionalLight,
  Engine,
  GlowLayer,
  HemisphericLight,
  ImageProcessingConfiguration,
  Scene,
  ShadowGenerator,
  Vector3,
} from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import {
  createBall,
  createBallState,
  triggerGapDeath,
  triggerHazardDeath,
  updateBall,
} from "./ball";
import {
  CAMERA_BOB_AMPLITUDE,
  CAMERA_BOB_SPEED,
  CAMERA_FOLLOW_LERP,
  CAMERA_FOV_BASE,
  CAMERA_TARGET_Y,
  CAMERA_TARGET_Z,
  CAMERA_VELOCITY_TILT_FACTOR,
  SLAM_FOV_PULSE_DECAY,
  SLAM_FOV_PULSE_STRENGTH,
} from "./config";
import { createDebugParams, attachDebugPanel } from "./debug";
import { attachInputHandlers, createInput } from "./input";
import { createGameState, updateGameState } from "./state";
import { createTrack, getTileKindUnderBall, updateTrack } from "./track";
import { createHud, updateHud } from "./ui";
import type { GameContext } from "./types";

function applyCanvasLayout(canvas: HTMLCanvasElement): void {
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.display = "block";
  canvas.style.touchAction = "none";
  document.documentElement.style.width = "100%";
  document.documentElement.style.height = "100%";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.width = "100%";
  document.body.style.height = "100%";
}

function smoothStep(current: number, target: number, dt: number, lerpRate: number): number {
  const t = 1 - Math.exp(-lerpRate * dt);
  return current + (target - current) * t;
}

export function applyCameraEffects(ctx: GameContext, dt: number): void {
  const inputX = (ctx.input.left ? -1 : 0) + (ctx.input.right ? 1 : 0);
  const inputZ = (ctx.input.down ? -1 : 0) + (ctx.input.up ? 1 : 0);
  const inputMagnitude = Math.min(1, Math.sqrt(inputX * inputX + inputZ * inputZ));

  const targetX =
    ctx.ball.position.x * ctx.debug.cameraFollowXFactor +
    ctx.ballState.velX * CAMERA_VELOCITY_TILT_FACTOR;
  const targetZ = CAMERA_TARGET_Z + ctx.ball.position.z * ctx.debug.cameraFollowZFactor;
  const bobY =
    CAMERA_TARGET_Y +
    Math.sin(ctx.gameState.time * CAMERA_BOB_SPEED) * CAMERA_BOB_AMPLITUDE;

  ctx.camera.target.x = smoothStep(ctx.camera.target.x, targetX, dt, CAMERA_FOLLOW_LERP);
  ctx.camera.target.y = smoothStep(ctx.camera.target.y, bobY, dt, CAMERA_FOLLOW_LERP);
  ctx.camera.target.z = smoothStep(ctx.camera.target.z, targetZ, dt, CAMERA_FOLLOW_LERP);

  const slamPulse = ctx.ballState.slamPulseTime;
  const targetFov =
    CAMERA_FOV_BASE +
    ctx.debug.cameraFovBoost * inputMagnitude +
    SLAM_FOV_PULSE_STRENGTH * (slamPulse > 0 ? slamPulse : 0);
  ctx.camera.fov = smoothStep(ctx.camera.fov, targetFov, dt, CAMERA_FOLLOW_LERP);

  if (ctx.ballState.slamPulseTime > 0) {
    ctx.ballState.slamPulseTime = Math.max(
      0,
      ctx.ballState.slamPulseTime - dt * SLAM_FOV_PULSE_DECAY
    );
  }
}

export function createGame(): GameContext {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("renderCanvas element not found");
  }

  applyCanvasLayout(canvas);

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color3(0.01, 0.01, 0.03);
  scene.fogMode = Scene.FOGMODE_EXP;
  scene.fogColor = new Color3(0.01, 0.01, 0.035);
  scene.fogDensity = 0.025;
  scene.imageProcessingConfiguration.exposure = 0.78;

  const envTex = CubeTexture.CreateFromPrefilteredData(
    "https://assets.babylonjs.com/environments/environmentSpecular.env",
    scene
  );
  scene.environmentTexture = envTex;

  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2.5,
    Math.PI / 3,
    20,
    new Vector3(0, 0, 10),
    scene
  );
  camera.fov = CAMERA_FOV_BASE;
  camera.attachControl(canvas, true);

  const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.2;

  const dirLight = new DirectionalLight("dirLight", new Vector3(0.25, -1, -0.35), scene);
  dirLight.position = new Vector3(0, 18, -6);
  dirLight.intensity = 1.05;

  const shadowGen = new ShadowGenerator(1024, dirLight);
  shadowGen.useContactHardeningShadow = true;
  shadowGen.contactHardeningLightSizeUVRatio = 0.3;
  shadowGen.darkness = 0.35;

  const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
  const gameOverText = new TextBlock();
  gameOverText.text = "GAME OVER\nPress SPACE to restart";
  gameOverText.color = "white";
  gameOverText.fontSize = 48;
  gameOverText.alpha = 0.0;
  gameOverText.outlineWidth = 4;
  gameOverText.outlineColor = "red";
  ui.addControl(gameOverText);

  const ballResources = createBall(scene);
  const ballState = createBallState();
  const track = createTrack(scene);
  const input = createInput();
  attachInputHandlers(input);
  const gameState = createGameState();
  const hud = createHud();
  const debug = createDebugParams();
  attachDebugPanel(debug);

  shadowGen.addShadowCaster(ballResources.mesh);
  for (const tile of track.tiles) {
    shadowGen.addShadowCaster(tile);
  }
  const glow = new GlowLayer("glow", scene);
  glow.intensity = 0.2;

  const ctx: GameContext = {
    engine,
    scene,
    camera,
    ui,
    gameOverText,
    ball: ballResources.mesh,
    ballMaterial: ballResources.material,
    ballBaseColor: ballResources.baseColor,
    ballState,
    track,
    input,
    gameState,
    hud,
    debug,
  };

  scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;

    updateGameState(dt, ctx);
    const isActive = ctx.gameState.pause === "running";

    if (isActive) {
      const justLanded = updateBall(dt, ctx);

      if (justLanded && ctx.gameState.mode === "playing") {
        const tileKind = getTileKindUnderBall(
          ctx.ball.position.x,
          ctx.ball.position.z,
          ctx.track,
          ctx
        );

        if (tileKind === "gap") {
          triggerGapDeath(ctx);
        } else if (tileKind === "hazard") {
          triggerHazardDeath(ctx);
        }
      }

      applyCameraEffects(ctx, dt);
    }

    // Keep track positions synced even while paused/countdown so visuals don't jump.
    updateTrack(dt, ctx);
    updateHud(ctx);
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });

  return ctx;
}
