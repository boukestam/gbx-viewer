import earcut from "earcut";
import * as THREE from "three";
import { Vec3, Color } from "../parser/types";

export interface MeshOutput {
  vertices: number[];
  colors: number[];
}

function area(data: number[]) {
  let sum = 0;
  for (let i = 0, j = data.length - 2; i < data.length; i += 2) {
    sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
    j = i;
  }
  return Math.abs(sum);
}

function triangle(a: Vec3, b: Vec3, c: Vec3, color: Color, out: MeshOutput) {
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

function polygon(
  points: Vec3[], 
  f: (point: Vec3, step: number) => Vec3, 
  step: number, 
  color: Color, 
  flip: boolean,
  out: MeshOutput
) {
  const transformed = points.map(p => f(p, step));

  const xyArea = area(transformed.reduce((a: number[], v) => {
    a.push(v.x, v.y);
    return a;
  }, []));
  const xzArea = area(transformed.reduce((a: number[], v) => {
    a.push(v.x, v.z);
    return a;
  }, []));
  const yzArea = area(transformed.reduce((a: number[], v) => {
    a.push(v.y, v.z);
    return a;
  }, []));

  const isXY = xyArea > xzArea && xyArea > yzArea;
  const isXZ = xzArea > xyArea && xzArea > yzArea;

  const coords = [];
  for (const t of transformed) {
    if (isXY) coords.push(t.x, t.y);
    else if (isXZ) coords.push(t.x, t.z);
    else coords.push(t.y, t.z);
  }
  const triangles = earcut(coords);

  for (let i = 0; i < triangles.length; i += 3) {
    triangle(
      transformed[triangles[i + (flip ? 2 : 0)]],
      transformed[triangles[i + 1]],
      transformed[triangles[i + (flip ? 0 : 2)]],
      color,
      out
    );
  }
}

export function shape(
  points: Vec3[],
  colors: Color[],
  f: (point: Vec3, step: number) => Vec3,
  steps: number,
  out: MeshOutput
) {
  polygon(points, f, 0, colors[0], true, out);

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < points.length; j++) {
      const next = (j + 1) % points.length;
      triangle(
        f(points[j], i + 1),
        f(points[next], i + 1),
        f(points[j], i),
        colors[j + 1],
        out
      );
      triangle(
        f(points[next], i + 1),
        f(points[next], i),
        f(points[j], i),
        colors[j + 1],
        out
      );
    }
  }

  polygon(points, f, steps, colors[points.length], false, out);
}

export function createMesh(out: MeshOutput) {
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

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      vertexColors: true,
      shadowSide: THREE.FrontSide
    })
  );

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
}

export function createCube(size: Vec3, color: Color) {
  const points = [
    new Vec3(-size.x * 0.5, -size.y * 0.5, 0),
    new Vec3(-size.x * 0.5, size.y * 0.5, 0),
    new Vec3(size.x * 0.5, size.y * 0.5, 0),
    new Vec3(size.x * 0.5, -size.y * 0.5, 0),
  ];

  const colors = [color, color, color, color, color, color];

  const out: MeshOutput = {
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