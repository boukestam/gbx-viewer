import { Vec3 } from "../parser/types";
import { CURVE_SIZE } from "../utils/constants";
import { BlockMesh } from "./block";
import { Colors } from "./colors";
import { createMesh, MeshOutput, triangle } from "./mesh";

export function createGrass(count: number): BlockMesh {
  const out: MeshOutput = {
    vertices: [],
    colors: [],
  };

  const topLeft = new Vec3(-CURVE_SIZE.x, 0, CURVE_SIZE.z);
  const topRight = new Vec3(CURVE_SIZE.x, 0, CURVE_SIZE.z);
  const bottomLeft = new Vec3(-CURVE_SIZE.x, 0, -CURVE_SIZE.z);
  const bottomRight = new Vec3(CURVE_SIZE.x, 0, -CURVE_SIZE.z);

  triangle(bottomLeft, topLeft, topRight, Colors.grassColor, out);
  triangle(bottomLeft, topRight, bottomRight, Colors.grassColor, out);

  console.log("Create grass");

  return {mesh: createMesh(out, count)}
}