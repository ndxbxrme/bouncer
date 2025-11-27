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

export class PBRMaterial extends StandardMaterial {
  albedoColor: Color3;
  metallic = 0;
  roughness = 0;
  environmentIntensity = 1;
  bumpTexture: any;
  constructor(name: string, scene?: any) {
    super(name, scene);
    this.albedoColor = new Color3();
  }
}

export class Mesh {
  position: Vector3 = new Vector3();
  scaling: Vector3 = new Vector3(1, 1, 1);
  isVisible = true;
  visibility = 1;
  receiveShadows = false;
  material: any;
  metadata: any;
  constructor(public name: string) {}
  createInstance(_name: string) {
    const inst = new Mesh(this.name);
    inst.material = this.material;
    return inst;
  }
  clone(name: string) {
    const clone = new Mesh(name);
    clone.material = this.material;
    clone.metadata = this.metadata;
    return clone;
  }
  setEnabled(_flag: boolean) {}
  dispose() {}
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
  fogMode: number | undefined;
  fogColor: Color3 | undefined;
  fogDensity: number | undefined;
  environmentTexture: any;
  imageProcessingConfiguration: { exposure?: number } = {};
  constructor(public engine?: Engine) {}
  getEngine() {
    return this.engine ?? new Engine();
  }
  createDefaultSkybox(_tex: any, _p1?: any, _p2?: any, _p3?: any, _p4?: any) {}
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

export class DirectionalLight {
  intensity = 1;
  position = new Vector3();
  constructor(public name: string, public direction: Vector3, public scene: Scene) {}
}

export class ShadowGenerator {
  useContactHardeningShadow = false;
  contactHardeningLightSizeUVRatio = 0;
  constructor(public size: number, public light: DirectionalLight) {}
  addShadowCaster(_mesh: any) {}
}

export class GlowLayer {
  intensity = 1;
  constructor(public name: string, public scene: Scene) {}
}

export class CubeTexture {
  static CreateFromPrefilteredData(_url: string, _scene: Scene) {
    return {};
  }
}

export class Texture {
  static WRAP_ADDRESSMODE = 1;
}

export class DynamicTexture extends Texture {
  wrapU = 0;
  wrapV = 0;
  level = 1;
  constructor(public name: string, public options: any, public scene?: any, public generateMipMaps?: boolean) {
    super();
  }
  getContext() {
    return {
      fillStyle: "",
      fillRect: (_x: number, _y: number, _w: number, _h: number) => {},
    };
  }
  update(_bool?: boolean) {}
}

export class VertexData {
  positions: number[] | undefined;
  indices: number[] | undefined;
  normals: number[] | undefined;
  static ExtractFromMesh(_mesh: Mesh) {
    return new VertexData();
  }
  static ComputeNormals(_positions: number[], _indices: number[], _normals: number[]) {}
  applyToMesh(_mesh: Mesh) {
    return this;
  }
}
