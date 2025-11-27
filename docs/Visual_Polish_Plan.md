# Visual Polish Plan – Bounder-Style Babylon.js Game

This document describes **visual / rendering upgrades** to apply to the existing refactored game (the one created from `demo.html`), so the look moves closer to the high-end mockup image.

It is written as **concrete instructions for an AI coding assistant (Codex)**.

---

## 0. Constraints

- Do **not** change core gameplay behaviour:
  - Movement, collision, bounce timing, squash/stretch, hazards, restart, tuning panel logic, etc. must remain functionally the same.
- All changes should be **visual only**, or confined to:
  - Materials, lighting, post-processing, camera feel, UI styling.

---

## 1. Materials & Mesh Appearance

### 1.1 Switch to PBR materials

For the main in-world objects, prefer `BABYLON.PBRMaterial` over `StandardMaterial`.

**Ball**

- Create a `PBRMaterial` for the ball:
  - `metallic` ~ `0.4–0.6`
  - `roughness` ~ `0.2–0.35`
  - `albedoColor`: warm yellow/gold similar to prototype.
  - Enable environment reflections via HDR environment texture (see Section 2).
- Keep existing squash/stretch scaling logic; only change the material.

**Safe tiles**

- Use `PBRMaterial` with:
  - `albedoColor`: medium, slightly cyan blue.
  - `roughness` ~ `0.5–0.7`
  - `metallic` ~ `0.1–0.2`
- Slight per-tile color variation (optional):
  - Use tiny HSV shifts or a 1D gradient texture sampled with a row index to avoid a flat look.

**Hazard tiles**

- Use `PBRMaterial` with:
  - `albedoColor`: saturated red / orange-red.
  - `emissiveColor`: same hue, lower intensity to drive glow layer.
  - `roughness` ~ `0.4–0.6`.
- Hazard tiles should read clearly brighter than safe tiles.

### 1.2 Edge bevel / geometry tweaks

- Where tile meshes are created, ensure they have:
  - Slightly larger height than before (e.g. 0.25–0.3) so they cast more noticeable shadows.
  - Optional: use `CreateBox` with `bevel` parameters if available, or create a custom polygon with softened edges.

---

## 2. Environment, Lighting, and Shadows

### 2.1 Environment texture

- Load an HDR environment texture (studio/light probe style) and assign it to:
  - `scene.environmentTexture`
  - Optionally create `scene.createDefaultSkybox(environmentTexture, ...)` with:
    - Very low intensity (we mostly want reflections, not a visible skybox).

### 2.2 Lights

- Keep or replace the existing hemispheric light with:
  1. A **directional light** to cast shadows:
     - Direction: roughly from above-left towards the track.
  2. A softer **hemispheric light** or low-intensity ambient term.

- Enable shadows:
  - Use `ShadowGenerator` with the directional light.
  - Add the ball and tiles as shadow casters where appropriate.
  - Enable `receiveShadows` on the tiles.

### 2.3 Glow / bloom

- Add a `BABYLON.GlowLayer`:
  - Low overall intensity (e.g. `0.5`).
  - This will pick up emissive areas (hazard tiles, UI glows).

- Optionally add a `DefaultRenderingPipeline`:
  - Enable `bloomEnabled = true`.
  - Set bloom threshold/intensity so emissive reds and blues glow softly, without washing out the scene.

---

## 3. Background & Atmosphere

### 3.1 Fog / void

- Use `scene.fogMode = BABYLON.Scene.FOGMODE_EXP;`
  - `fogColor`: deep blue or very dark navy.
  - `fogDensity`: small value (e.g. `0.01–0.03`) so tiles fade into darkness with distance.

- Alternatively (or additionally):
  - Create a very large, dark gradient plane far below the track as a “floor” that catches light slightly.

### 3.2 Distant ambience (optional)

- Add a few very low-intensity background mesh elements (e.g. blurred pillars, floating shapes) far away, mostly to give subtle parallax when the camera moves. These should be simple and not distract from the track.

---

## 4. Camera Feel

### 4.1 Camera position and FOV

- Keep the general ArcRotate / follow style, but:
  - Slightly tilt and raise the camera so the track converges more dramatically in the distance.
  - Animate FOV subtly based on speed / bounce (there may already be a “FOV Boost” setting; keep it but polish the effect).

### 4.2 Screen shake / micro motion (optional)

- Implement a very small, temporary camera offset when:
  - The player dies (gap or hazard).
  - Possibly on extremely hard landings, if such states exist.

- This should be subtle: a few pixels over 0.1–0.2 seconds.

---

## 5. Particle FX

### 5.1 Hazard hit

When the player dies on a hazard tile:

- Spawn a short-lived particle system at the ball position:
  - Texture: small soft sprite (if none available, use a simple disk gradient).
  - Color: match hazard red/orange.
  - Velocity: small upward and outward burst.
  - Lifetime: ~0.3–0.6 seconds.
- Stop emitting quickly so it feels like a pop, not a continuous effect.

### 5.2 Gap fall

When the player falls into a gap:

- Optionally emit a few fading particles as the ball crosses the tile plane and starts falling.
- These particles can be blue-ish, trailing upwards as the ball descends.

Keep particle counts small for performance.

---

## 6. UI Styling

Assume there is already:

- A left-side HUD with title, distance, time, status text.
- A right-side tuning panel with sliders.

Update the CSS / Babylon GUI styling:

- Rounded corners for panels.
- Slight background blur or translucent dark panels (glassmorphism style).
- Light inner glow / border.
- Consistent typography:
  - Title in a bold sans-serif.
  - Numbers (distance, time) in a clear monospace or semi-mono font.

Wherever possible, keep UI layout and logic unchanged; only update visual styling.

---

## 7. Implementation Order

Suggested order of work:

1. **Environment + PBR materials**
   - HDR environment
   - PBR ball + tiles
2. **Lighting + shadows**
   - Directional light, shadows, minor ambient light
3. **Glow / bloom**
   - Glow layer and optional rendering pipeline
4. **Fog / background**
   - Fog settings and/or gradient floor
5. **UI polish**
   - CSS / GUI style tweaks
6. **Particles & camera micro FX**
   - Hazard pop particles
   - Gap fall particles
   - Subtle camera shake on death

After each step, verify:

- Performance remains acceptable.
- Visual clarity of safe vs hazard vs gap is preserved or improved.

---

## 8. Acceptance Criteria

The visual polish pass is **complete** when:

- The game retains all previous mechanics and tuning behaviour.
- The scene exhibits:
  - Reflective, nicely lit PBR ball and tiles.
  - Soft shadows and a sense of depth.
  - Emissive/glowing hazard tiles.
  - Atmospheric fog or a sense of a dark void.
  - A more refined UI style.
- The new effects (glow, shadows, particles) do **not** interfere with gameplay readability.
- Code remains organized within the existing modular structure (`scene.ts`, `ball.ts`, `track.ts`, etc.), with visual concerns kept in their appropriate modules.
