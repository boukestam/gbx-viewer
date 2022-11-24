import { Vec3 } from "../parser/types";
import { BLOCK_SIZE, CURVE_SIZE } from "../utils/constants";
import { BlockMesh } from "./block";
import { Colors } from "./colors";
import { createMesh, MeshOutput, triangle } from "./mesh";

export function createGrass(count: number): BlockMesh {
  const out: MeshOutput = {
    vertices: [],
    colors: [],
  };

  const quarter = BLOCK_SIZE.x * 0.25;

  for (let i = 0; i < 4; i++) {
    const left = -CURVE_SIZE.x + i * quarter;
    const right = -CURVE_SIZE.x + (i + 1) * quarter;

    const topLeft = new Vec3(left, 0, CURVE_SIZE.z);
    const topRight = new Vec3(right, 0, CURVE_SIZE.z);
    const bottomLeft = new Vec3(left, 0, -CURVE_SIZE.z);
    const bottomRight = new Vec3(right, 0, -CURVE_SIZE.z);

    const color = i % 2 === 0 ? Colors.grassColor : Colors.grassDarkColor;

    triangle(bottomLeft, topLeft, topRight, color, out);
    triangle(bottomLeft, topRight, bottomRight, color, out);
  }

  return {mesh: createMesh(out, count)}
}