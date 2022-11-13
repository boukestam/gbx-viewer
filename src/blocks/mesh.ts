import earcut from "earcut";
import * as THREE from "three";
import { Vec3, Color } from "../parser/types";

export interface MeshOutput {
  vertices: number[];
  colors: number[];
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

export function shape(
  points: Vec3[],
  colors: Color[],
  f: (point: Vec3, step: number) => Vec3,
  steps: number,
  out: MeshOutput
) {
  const coords = [];
  for (const point of points) coords.push(point.x, point.y);
  const triangles = earcut(coords);

  for (let i = 0; i < triangles.length; i += 3) {
    triangle(
      f(points[triangles[i + 2]], 0),
      f(points[triangles[i + 1]], 0),
      f(points[triangles[i]], 0),
      colors[0],
      out
    );
  }

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

  for (let i = 0; i < triangles.length; i += 3) {
    triangle(
      f(points[triangles[i]], steps),
      f(points[triangles[i + 1]], steps),
      f(points[triangles[i + 2]], steps),
      colors[points.length - 1],
      out
    );
  }
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