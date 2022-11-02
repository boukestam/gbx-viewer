import earcut from "earcut";
import * as THREE from "three";
import { Vec3, Color } from "./parser/types";

interface Output {
  vertices: number[];
  colors: number[];
}

function triangle(a: Vec3, b: Vec3, c: Vec3, color: Color, out: Output) {
  out.vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  out.colors.push(
    color.r,
    color.g,
    color.b,
    color.r,
    color.g,
    color.b,
    color.r,
    color.g,
    color.b
  );
}

function shape(
  points: Vec3[],
  colors: Color[],
  f: (point: Vec3, step: number) => Vec3,
  steps: number,
  out: Output
) {
  const coords = [];
  for (const point of points) coords.push(point.x, point.y);
  const triangles = earcut(coords);

  for (let i = 0; i < triangles.length; i += 3) {
    triangle(
      f(points[triangles[i]], 0),
      f(points[triangles[i + 1]], 0),
      f(points[triangles[i + 2]], 0),
      colors[0],
      out
    );
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < points.length; j++) {
      const next = (j + 1) % points.length;
      triangle(
        f(points[j], i),
        f(points[next], i + 1),
        f(points[j], i + 1),
        colors[j + 1],
        out
      );
      triangle(
        f(points[j], i),
        f(points[next], i),
        f(points[next], i + 1),
        colors[j + 1],
        out
      );
    }
  }

  for (let i = 0; i < triangles.length; i += 3) {
    triangle(
      f(points[triangles[i]], steps),
      f(points[triangles[i + 1]], steps),
      f(points[triangles[i + 2]], steps),
      colors[steps - 1],
      out
    );
  }
}

function createMesh(out: Output) {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(out.vertices), 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(out.colors), 3)
  );
  geometry.computeVertexNormals();

  return new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    })
  );
}

export function createCube(size: Vec3, color: Color) {
  const points = [
    new Vec3(-size.x * 0.5, -size.y * 0.5, 0),
    new Vec3(-size.x * 0.5, size.y * 0.5, 0),
    new Vec3(size.x * 0.5, size.y * 0.5, 0),
    new Vec3(size.x * 0.5, -size.y * 0.5, 0),
  ];

  const colors = [color, color, color, color, color, color];

  const out: Output = {
    vertices: [],
    colors: [],
  };

  shape(
    points,
    colors,
    (point, step) => point.add(new Vec3(0, 0, size.z).mul(step)),
    1,
    out
  );

  return createMesh(out);
}

export function createRoad(name: string) {
  const left = -16;
  const right = 16;
  const borderHeight = 1.6;
  const borderWidth = 1.8;
  const trackHeight = 0.8;

  const points = [
    new Vec3(left, 0, 0),
    new Vec3(left, borderHeight, 0),
    new Vec3(left + borderWidth, borderHeight, 0),
    new Vec3(left + borderWidth, trackHeight, 0),

    new Vec3(right - borderWidth, trackHeight, 0),
    new Vec3(right - borderWidth, borderHeight, 0),
    new Vec3(right, borderHeight, 0),
    new Vec3(right, 0, 0),
  ];

  const borderColor = { r: 1, g: 1, b: 1 };
  const borderSideColor = { r: 0, g: 0, b: 0 };
  const trackColor = { r: 226 / 255, g: 98 / 255, b: 52 / 255 };
  const edgeColor = { r: 0.2, g: 0.2, b: 0.2 };

  const colors = [
    edgeColor,
    borderColor,
    borderColor,
    borderSideColor,
    trackColor,
    borderSideColor,
    borderColor,
    borderColor,
    borderColor,
    edgeColor,
  ];

  const out: Output = {
    vertices: [],
    colors: [],
  };

  let f = (point: Vec3, step: number) =>
    point.sub(new Vec3(0, 0, 16)).add(new Vec3(0, 0, 32).mul(step));
  let numSteps = 1;
  let worldOffset = new Vec3(16, 0, 16);

  if (name.includes("Curve")) {
    const amount = parseInt(name[name.length - 1]);
    worldOffset = new Vec3(0, 0, 0);

    const pivotOffset = new THREE.Vector3(amount * 32 - 16, 0, 0);
    const offset = new THREE.Vector3(amount * 16 - 16, 0, amount * 16);
    const axis = new THREE.Vector3(0, 1, 0);
    numSteps = 10;

    f = (point: Vec3, step: number) => {
      const rotated = point
        .toTHREE()
        .sub(pivotOffset)
        .applyAxisAngle(axis, step * (Math.PI / 2 / numSteps))
        .add(pivotOffset)
        .sub(offset);
      return new Vec3(rotated.x, rotated.y, rotated.z);
    };
  }

  shape(points, colors, f, numSteps, out);

  return {
    mesh: createMesh(out),
    offset: worldOffset,
  };
}
