# Bounder-Style Babylon.js Prototype -- Design Document

## Overview

This project is a modern, Babylon.js--powered interpretation of the
classic 1985 game *Bounder*. The goal is to recreate the distinctive
feeling of guiding a continuously bouncing tennis ball across a
hazardous, scrolling landscape---while leveraging modern 3D rendering,
smoother controls, and expressive animation techniques.

This document summarizes: - What has been implemented so far - Key
design decisions and rationale - Known issues / refinements to
consider - Suggested next steps for development

------------------------------------------------------------------------

## Current Feature Set

### 1. Core Scene & Rendering

-   Babylon.js engine with a simple hemispheric light and
    ArcRotateCamera.
-   Infinite scrolling tile track using row recycling.
-   A bouncing ball mesh with procedural movement (using sine-wave
    physics).

### 2. Player Movement

-   Smooth lateral and limited forward/back movement (no lane snapping).
-   Collision is only evaluated when the ball "lands," making diagonal
    dodging fair.
-   Input: Arrow keys or WASD for movement.

### 3. Tile & Hazard System

Track is composed of rows of tiles, each tile in one of three states: -
**Safe tile** -- visible and solid. - **Gap** -- invisible tile; landing
triggers a fall death sequence. - **Hazard tile** -- visible red
obstacle; landing triggers an instant hazard death.

Track rows are generated semi-randomly with guaranteed survivable paths.

### 4. Bounce Animation

-   Sine-based vertical motion.
-   Phase tracking for detecting landing events.
-   Proper timing to ensure the ball glides and arcs like the original
    game.

### 5. Squash & Stretch (Character Animation Flair)

Inspired by classic 2D animation principles: - **Stretch** on upward
movement to imply speed. - **Squash** on ground contact, softened and
smoothed through lerp. - Volume preservation approximation via inverse
scaling. - Disabled during fall/hazard death states.

### 6. Death & Restart Flow

-   **Gap death**: Ball falls with gravity, shrinking as it descends;
    scrolling stops.
-   **Hazard death**: Ball flashes red and motion freezes.
-   **Game Over UI** overlay fades in.
-   Press **SPACE** to reset the game state fully.

------------------------------------------------------------------------

## Design Rationale

### Movement Philosophy

The original *Bounder* enforced strict lane-based motion and unforgiving
collision.\
We chose a more fluid model that: - Preserves the feel of forward
momentum, - Allows skill-based micro-adjustments, - Reduces "inevitable"
deaths from diagonally aligned hazards.

### Procedural Track Generation

Random generation keeps gameplay dynamic and replayable while: -
Enforcing fairness (at least one safe tile per row), - Supporting future
expansion into level "chunks" or handcrafted patterns.

### Animation Emphasis

The squash & stretch gives the ball: - Weight\
- Personality\
- A subtle but important emotional connection to classic animated
physics

This goes a long way in making the game *feel* polished even before
adding art assets.

------------------------------------------------------------------------

## Known Issues / Areas for Refinement

### 1. Bounce Timing

Occasional visual oddities can occur depending on frame timing and
scroll rate.\
We may want to: - Switch from sine-based bounce to an animation curve, -
Sync bounce duration more tightly to movement speed.

### 2. Collision Granularity

Mapping from ball X/Z to tile lanes works well, but: - True continuous
collision (non-lane-based) may allow more expressive level shapes. -
Hazards could eventually be mesh-based hitboxes.

### 3. Camera Feel

Camera could be more *Bounder*-like: - Slight tilt changes, - Follow
offset based on player movement, - Subtle bob or procedural shake.

### 4. Restart Flow

Currently instant. Could use: - Fade in/out, - "Get Ready" countdown, -
A proper title screen.

------------------------------------------------------------------------

## Recommended Roadmap

### **Phase 1 --- Core Polish**

-   Improve bounce curve (Bezier, ease-in-out).
-   Tweak squash/stretch response.
-   Refine track generation for more rhythmic, intentional patterns.

### **Phase 2 --- Gameplay Systems**

-   Add collectible points or stars.
-   Add checkpoint system.
-   Introduce special tiles:
    -   Jump boosters
    -   Slippery tiles
    -   Breakaway tiles
    -   Moving platforms

### **Phase 3 --- Visual Pass**

-   Add better materials, shadows, and fog.
-   Introduce stylized post-processing (CRT bloom? vignette?).
-   Add a trail or motion blur to the ball.

### **Phase 4 --- Audio**

-   Bounce SFX, hazard death sounds, and ambient track.
-   Procedural pitch variation on bounces.

### **Phase 5 --- UX & Structure**

-   Title screen, pause menu, settings.
-   Scoring system (distance survived, collectibles).
-   Difficulty scaling over time.

### **Phase 6 --- Packaging**

-   Web build optimizations.
-   Deploy to itch.io or GitHub Pages.

------------------------------------------------------------------------

## Final Thoughts

This prototype already **feels like a game**, which is rare at this
stage.\
The combination of: - expressive animation\
- fair collision\
- smooth movement\
- simple but readable visuals

...gives us an insanely solid foundation to build on.

The next steps are really about **leaning into identity**:\
Do we want "retro 3D," pastel modern minimalism, neon synthwave, cute
toon shading?\
Any of these would pair beautifully with the core mechanics we've built.

------------------------------------------------------------------------

## Document Version

**v1.0 --- ChatGPT Design Draft**\
Created to support migration to GitHub + Codex tooling.
