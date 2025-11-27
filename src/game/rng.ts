export interface Rng {
  next(): number; // [0, 1)
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return {
    next() {
      // LCG parameters from Numerical Recipes
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0xffffffff;
    },
  };
}

