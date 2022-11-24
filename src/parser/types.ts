import * as THREE from "three";

export class Color {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r: number, g: number, b: number, a?: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a || 1;
  }

  toTHREE() {
    return new THREE.Color(
      this.r, this.g, this.b
    )
  }

  static zero() {
    return new Color(0, 0, 0);
  }
}

export interface FileRef {
  version: number;
  filePath: string;
  checksum: Buffer | undefined;
  locatorUrl: string | undefined;
};

export interface Vec2 {
  x: number;
  y: number;
}

export class Vec3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(other: Vec3) {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other: Vec3) {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  mul(other: Vec3) {
    return new Vec3(this.x * other.x, this.y * other.y, this.z * other.z);
  }

  div(other: Vec3) {
    return new Vec3(this.x / other.x, this.y / other.y, this.z / other.z);
  }

  addScalar(value: number) {
    return new Vec3(this.x + value, this.y + value, this.z + value);
  }

  subScalar(value: number) {
    return new Vec3(this.x - value, this.y - value, this.z - value);
  }

  mulScalar(value: number) {
    return new Vec3(this.x * value, this.y * value, this.z * value);
  }

  divScalar(value: number) {
    return new Vec3(this.x / value, this.y / value, this.z / value);
  }

  toTHREE() {
    return new THREE.Vector3(
      this.x, this.y, this.z
    )
  }

  static zero() {
    return new Vec3(0, 0, 0);
  }
}

export interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x: number, y: number, z: number, w: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  toTHREE() {
    return new THREE.Quaternion(
      this.x, this.y, this.z, this.w
    )
  }

  static zero() {
    return new Quaternion(0, 0, 0, 0);
  }
}

export interface Transform {
  position: Vec3;
  rotation: Quaternion;
  speed: number;
  velocity: Vec3;
};

export interface Chunk {
  id: number;
}

export interface Node {
  [key: string]: any,
  classId: number;
}
