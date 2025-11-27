import * as BABYLON from "babylonjs";
import type { BallState, GameContext } from "./types";
import {
  BALL_DIAMETER,
  BASE_HEIGHT,
  BOUNCE_HEIGHT,
  BOUNCE_SPEED,
  FORWARD_BACK_SPEED,
  GAP_FALL_GRAVITY,
  GAP_FALL_SHRINK_RATE,
  LATERAL_SPEED,
  SQUASH_STRENGTH,
  STRETCH_STRENGTH,
} from "./config";

export interface BallResources {
  mesh: BABYLON.Mesh;
  material: BABYLON.PBRMaterial;
  baseColor: BABYLON.Color3;
}

export function createBall(scene: BABYLON.Scene): BallResources {
  const ball = BABYLON.MeshBuilder.CreateSphere(
    "ball",
    { diameter: BALL_DIAMETER },
    scene
  );
  ball.position = new BABYLON.Vector3(0, BASE_HEIGHT, 0);

  const material = new BABYLON.PBRMaterial("ballMat", scene);
  const baseColor = new BABYLON.Color3(1, 0.9, 0.3);
  material.albedoColor = baseColor.clone();
  material.metallic = 0.55;
  material.roughness = 0.22;
  material.environmentIntensity = 0.9;
  material.emissiveColor = new BABYLON.Color3(0.08, 0.06, 0.02);
  ball.material = material;
  ball.receiveShadows = true;

  return { mesh: ball, material, baseColor };
}

export function createBallState(): BallState {
  return {
    bouncePhase: 0,
    fallVelocityY: 0,
    fallScale: 1,
    velX: 0,
    velZ: 0,
    activeBounceMultiplier: 1,
    nextBounceBoost: 1,
    slamPulseTime: 0,
  };
}

export function resetBall(ctx: GameContext): void {
  ctx.ball.position.x = 0;
  ctx.ball.position.y = BASE_HEIGHT;
  ctx.ball.position.z = 0;
  ctx.ball.scaling.setAll(1);
  ctx.ballMaterial.diffuseColor = ctx.ballBaseColor.clone();

  ctx.ballState.bouncePhase = 0;
  ctx.ballState.fallVelocityY = 0;
  ctx.ballState.fallScale = 1;
  ctx.ballState.velX = 0;
  ctx.ballState.velZ = 0;
  ctx.ballState.activeBounceMultiplier = 1;
  ctx.ballState.nextBounceBoost = 1;
  ctx.ballState.slamPulseTime = 0;
}

export function triggerGapDeath(ctx: GameContext): void {
  if (ctx.gameState.mode !== "playing") return;
  ctx.gameState.mode = "dead_gap";
  ctx.ballState.fallVelocityY = 0;
  ctx.ballState.fallScale = 1;
  ctx.gameOverText.alpha = 1.0;
  ctx.ballMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.8, 1.0);
}

export function triggerHazardDeath(ctx: GameContext): void {
  if (ctx.gameState.mode !== "playing") return;
  ctx.gameState.mode = "dead_hazard";
  ctx.gameOverText.alpha = 1.0;
  ctx.ballMaterial.diffuseColor = new BABYLON.Color3(1, 0.3, 0.3);
}

export function updateBall(dt: number, ctx: GameContext): boolean {
  const { ball, ballState } = ctx;
  const mode = ctx.gameState.mode;
  const isPlaying = mode === "playing";

  const prevBouncePhase = ballState.bouncePhase;

  if (isPlaying) {
    if (ctx.input.slamRequested && ctx.gameState.slamTokens > 0) {
      ctx.input.slamRequested = false;
      ctx.gameState.slamTokens -= 1;
      ballState.nextBounceBoost = ctx.debug.slamBounceMultiplier;
      ballState.bouncePhase = Math.PI - 0.01; // force wrap/landing on next step
      ballState.slamPulseTime = 0.35;
    }

    ballState.bouncePhase += ctx.debug.bounceSpeed * dt;
    if (ballState.bouncePhase > Math.PI) {
      ballState.bouncePhase -= Math.PI;
    }
  } else {
    ctx.input.slamRequested = false;
  }

  if (mode === "playing" || mode === "dead_hazard") {
    const heightFactor = Math.sin(ballState.bouncePhase);
    ball.position.y =
      BASE_HEIGHT + heightFactor * ctx.debug.bounceHeight * ballState.activeBounceMultiplier;

    if (isPlaying) {
      let inputX = 0;
      let inputZ = 0;
      if (ctx.input.left) inputX -= 1;
      if (ctx.input.right) inputX += 1;
      if (ctx.input.up) inputZ += 1;
      if (ctx.input.down) inputZ -= 1;

      let magnitude = Math.sqrt(inputX * inputX + inputZ * inputZ);
      if (magnitude > 0) {
        inputX /= magnitude;
        inputZ /= magnitude;
      }

      // Acceleration and friction for smoother, less twitchy movement.
      const accelX = inputX * ctx.debug.lateralAcceleration;
      const accelZ = inputZ * ctx.debug.lateralAcceleration;
      ballState.velX += accelX * dt;
      ballState.velZ += accelZ * dt;

      // Apply friction decay.
      const friction = Math.exp(-ctx.debug.lateralFriction * dt);
      ballState.velX *= friction;
      ballState.velZ *= friction;

      // Clamp speeds independently for lateral vs forward/back feel.
      const maxXSpeed = LATERAL_SPEED;
      const maxZSpeed = FORWARD_BACK_SPEED;
      ballState.velX = Math.max(-maxXSpeed, Math.min(maxXSpeed, ballState.velX));
      ballState.velZ = Math.max(-maxZSpeed, Math.min(maxZSpeed, ballState.velZ));

      ball.position.x += ballState.velX * dt;
      ball.position.z += ballState.velZ * dt;

      ball.position.x = Math.max(ctx.track.minX, Math.min(ctx.track.maxX, ball.position.x));
      ball.position.z = Math.max(
        -ctx.track.maxZOffset,
        Math.min(ctx.track.maxZOffset, ball.position.z)
      );

      const speedFactor = Math.abs(Math.cos(ballState.bouncePhase));
      const squash = SQUASH_STRENGTH * (1 - heightFactor) * speedFactor;
      const stretch = STRETCH_STRENGTH * speedFactor * heightFactor;

      let targetScaleY = 1 + stretch - squash;
      targetScaleY = Math.max(0.7, Math.min(1.25, targetScaleY));
      const targetScaleXZ = 1 / Math.sqrt(targetScaleY);

      const lerpSpeed = 10 * dt;
      ball.scaling.y = BABYLON.Scalar.Lerp(ball.scaling.y, targetScaleY, lerpSpeed);
      ball.scaling.x = BABYLON.Scalar.Lerp(ball.scaling.x, targetScaleXZ, lerpSpeed);
      ball.scaling.z = ball.scaling.x;
    }
  } else if (mode === "dead_gap") {
    ballState.fallVelocityY -= GAP_FALL_GRAVITY * dt;
    ball.position.y += ballState.fallVelocityY * dt;

    ballState.fallScale = Math.max(0, ballState.fallScale - GAP_FALL_SHRINK_RATE * dt);
    ball.scaling.setAll(ballState.fallScale);
  }

  const justLanded = isPlaying && prevBouncePhase > ballState.bouncePhase;
  if (justLanded) {
    ballState.activeBounceMultiplier = ballState.nextBounceBoost;
    ballState.nextBounceBoost = 1;
  }
  return justLanded;
}
