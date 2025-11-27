// Minimal Babylon.js stand-ins for unit tests.
export class Color3 {
  constructor(public r = 0, public g = 0, public b = 0) {}
  clone() {
    return new Color3(this.r, this.g, this.b);
  }
}

export class Vector3 {
  constructor(public x = 0, public y = 0, public z = 0) {}
  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  setAll(v: number) {
    this.x = v;
    this.y = v;
    this.z = v;
    return this;
  }
}

export class StandardMaterial {
  diffuseColor: Color3;
  specularColor: Color3;
  emissiveColor: Color3;
  constructor(public name: string, _scene?: any) {
    this.diffuseColor = new Color3();
    this.specularColor = new Color3();
    this.emissiveColor = new Color3();
  }
}

export class Mesh {
  position: Vector3 = new Vector3();
  scaling: Vector3 = new Vector3(1, 1, 1);
  isVisible = true;
  visibility = 1;
  material: any;
  metadata: any;
  constructor(public name: string) {}
}

export class MeshBuilder {
  static CreateBox(name: string, _options: any, _scene: any) {
    return new Mesh(name);
  }
  static CreateSphere(name: string, _options: any, _scene: any) {
    return new Mesh(name);
  }
}

export class Scalar {
  static Lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }
}

export class Engine {
  constructor(public canvas?: any, public antialias?: boolean) {}
  getDeltaTime() {
    return 16.666;
  }
  resize() {}
  runRenderLoop(_fn: () => void) {}
}

export class Scene {
  clearColor: Color3 = new Color3();
  onBeforeRenderObservable = { add: (_fn: (args?: any) => void) => {} };
  constructor(public engine?: Engine) {}
  getEngine() {
    return this.engine ?? new Engine();
  }
}

export class ArcRotateCamera {
  target: Vector3;
  fov = 0.8;
  constructor(
    public name: string,
    public alpha: number,
    public beta: number,
    public radius: number,
    target: Vector3,
    public scene: Scene
  ) {
    this.target = target;
  }
  attachControl(_canvas: any, _bool: boolean) {}
}

export class HemisphericLight {
  intensity = 1;
  constructor(public name: string, public direction: Vector3, public scene: Scene) {}
}
