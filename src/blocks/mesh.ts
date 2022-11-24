import earcut from "earcut";
import * as THREE from "three";
import { InstancedMesh } from "three";
import { ELayerType } from "../parser/classes/CPlugCrystal";
import { GeometryLayer, Material } from "../parser/nodes";
import { Vec3, Color } from "../parser/types";
import { Colors } from "./colors";
import { getDifficultyColor } from "./surface";

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

export function triangle(a: Vec3, b: Vec3, c: Vec3, color: Color, out: MeshOutput) {
  out.vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  out.colors.push(
    color.r,
    color.g,
    color.b,
    color.a,
    color.r,
    color.g,
    color.b,
    color.a,
    color.r,
    color.g,
    color.b,
    color.a
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
  if (colors.length !== points.length + 2) {
    throw new Error(`Invalid colors length points(${points.length}) colors(${colors.length})`);
  }

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

  polygon(points, f, steps, colors[points.length + 1], false, out);
}

export function createMesh(out: MeshOutput, count: number): InstancedMesh {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(out.vertices), 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(out.colors), 4)
  );
  geometry.computeVertexNormals();

  let transparent = false;
  for (let i = 0; i < out.colors.length; i += 4) {
    if (out.colors[i] < 1) transparent = true;
  }

  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shadowSide: THREE.FrontSide,
    transparent: transparent,
    flatShading: false,
    shininess: 0,
    reflectivity: 0
  });

  const mesh = new THREE.InstancedMesh(
    geometry,
    material,
    count
  );

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
}

export function createCrystal(crystal: any, difficulty: number): MeshOutput {
  const geometry = crystal.layers.find((layer: any) => layer.type === ELayerType.Geometry) as GeometryLayer;

  const out: MeshOutput = {
    vertices: [],
    colors: []
  };

  const getColor = (material: Material) => {
    if (material.link.includes("Plastic")) return getDifficultyColor(difficulty, Colors.plastic);
    if (material.link.includes("Dirt")) return Colors.dirtColor;
    if (material.link.includes("Grass")) return Colors.grassColor;
    if (material.link.includes("Ice")) return Colors.iceColor;
    if (material.link.includes("Tech")) return Colors.techColor;
    if (material.link.includes("Water")) return Colors.waterColor;
    return Colors.bottomColor;
  };

  for (const face of geometry.faces) {
    if (face.verts.length === 3) {
      triangle(face.verts[0].position, face.verts[1].position, face.verts[2].position, getColor(face.material), out);
    } else if (face.verts.length === 4) {
      triangle(face.verts[0].position, face.verts[1].position, face.verts[2].position, getColor(face.material), out);
      triangle(face.verts[0].position, face.verts[2].position, face.verts[3].position, getColor(face.material), out);
    }
  }
  
  return out;
}